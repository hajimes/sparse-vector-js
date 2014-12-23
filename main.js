// UMD returnExports style wrapper
// See https://github.com/umdjs/umd/blob/master/returnExports.js
(function(root, factory) {
  'use strict';

  /* istanbul ignore next */
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.SparseVector = factory();
  }
}(this, /** @lends */ function() {
  /* global Uint32Array, Float64Array */
  'use strict';

  /**
   * Pure-JavaScript sparse vector implementation.
   *
   * @constructor
   * @param {object} map - map representation 
   */
  function SparseVector(map) {
    var self;
    var keys;
    
    self = (this instanceof SparseVector) ?
      this : Object.create(SparseVector.prototype);
    
    map = (map === undefined) ? {} : map;
    
    keys = Object.getOwnPropertyNames(map);
    keys.sort(function(a, b) {
      return a - b;
    });
        
    self._indices = new Uint32Array(keys.length);
    self._elements = new Float64Array(keys.length);

    keys.forEach(function(key, i) {
      self._indices[i] = key;
      self._elements[i] = map[key];
    });
    
    return self;
  }
  
  var proto = SparseVector.prototype;
  
  /**
   * Returns the length of an internal indices array.
   *
   * To get the number of non-zero elements, use `l0`.
   *
   * @return {number} length of an internal indices array
   */
  proto.length = function() {
    return this._indices.length;
  };
  
  /**
   * Returns the iterator of the vector.
   *
   * The returned iterator conforms to the protocol in ECMAScript 6.
   *
   * @return {Iterator}
   */
  proto.iterator = function() {
    var pos = 0;
    var self = this;
    return {
      next: function() {
        var v;
        if (pos < self.length()) {
          v = {index: self._indices[pos], element: self._elements[pos]};
          pos += 1;
          return {value: v, done: false}; 
        } else {
          return {done: true};
        }
      }
    };
  };
  
  /**
   * Returns the dot-product between the sparse vector and a dense vector.
   *
   * @param {number[]|TypedArray} dense - array representation of a dense
   * @returns {number} - dot-product between the sparse and a dense
   */
  proto.dot = function(dense) {    
    var i, sum, index;
    var maxIndex = dense.length - 1;
    
    for (i = 0, sum = 0; i < this._indices.length; i += 1) {
      index = this._indices[i];
      if (index > maxIndex) {
        return sum;
      }
      sum += this._elements[i] * dense[index];      
    }
    
    return sum;
  };
  
  /**
   * Returns the dot-product between two sparse vectors.
   *
   * @param {SparseVector} sv - a sparse vector
   * @returns {number} - dot-product between two sparse
   */
  proto.sdot = function(sv2) {
    var i1, i2, index1, index2, sum;
    var sv1 = this;
    
    sum = 0;
    
    i1 = 0;
    i2 = 0;
    
    while (i2 < sv2._indices.length) {
      index2 = sv2._indices[i2];
      
      while (i1 < sv1._indices.length) {
        index1 = sv1._indices[i1];
        
        if (index1 === index2) {
          sum += sv1._elements[i1] * sv2._elements[i2];
        } else if (index1 > index2) {
          break;
        }

        i1 += 1;
      }
      
      i2 += 1;
    }

    return sum;
  };
  
  /**
   * Update the dense by an equation dense := dense + alpha * this.
   *
   * @param {number[]|TypedArray} dense - dense vector to be updated
   * @param {number} alpha - coefficient for this sparse vector
   * @return {number[]|TypedArray}
   */
  proto.addTo = function(dense, alpha) {
    var i, index;
    
    alpha = (alpha === undefined) ? 1 : alpha;
    
    for (i = 0; i < this._indices.length; i += 1) {
      index = this._indices[i];
      if (index >= dense.length) {
        break;
      }
      dense[index] += alpha * this._elements[i];
    }
    
    return dense;
  };
  
  /**
   * Returns the L0 norm, or the number of non-zero elements.
   *
   * @return {number} L0 norm
   */
  proto.l0 = function() {
    var i, sum, v;

    for (i = 0, sum = 0; i < this._elements.length; i += 1) {
      v = this._elements[i];
      if (v !== 0) {
        sum += 1;
      }
    }

    return sum;
  };
  
  /**
   * Returns the L1 norm.
   *
   * @return {number} L1 norm
   */
  proto.l1 = function() {
    var i, sum, v;
    
    for (i = 0, sum = 0; i < this._elements.length; i += 1) {
      v = this._elements[i];
      sum += Math.abs(v);
    }
    
    return sum;
  };
  
  /**
   * Returns the L2 norm.
   *
   * @return {number} L2 norm
   */
  proto.l2 = function() {
    return Math.sqrt(this.l2sq());
  };
  
  /**
   * Returns the square of L2 norm.
   *
   * @return {number} square of L2 norm
   */
  proto.l2sq = function() {
    var i, sum, v;
    
    for (i = 0, sum = 0; i < this._elements.length; i += 1) {
      v = this._elements[i];
      sum += v * v;
    }
    
    return sum;
  };
  
  /**
   * Returns the L-infinity norm, or the "maximum" norm.
   *
   * @return {number} L-infinity norm of the vector
   */
  proto.linf = function() {
    var i, max, v;
    
    for (i = 0, max = 0; i < this._elements.length; i += 1) {
      v = Math.abs(this._elements[i]);
      max = (max < v) ? v : max;
    }
    
    return max;
  };
  
  /**
   * Returns the Lp norm.
   *
   * For p = 0, 1, 2, infinity, use l0, l1, l2, linf, respectively.
   *
   * @return {number} p - Lp norm
   * @throws {RangeError} if `p` is not greater than 0
   */
  proto.lp = function(p) {
    var i, sum, v;
    
    if (p === undefined || p <= 0) {
      throw new RangeError('first arg must be greater than 0');
    }
    
    for (i = 0, sum = 0; i < this._elements.length; i += 1) {
      v = this._elements[i];
      sum += Math.pow(v, p);
    }
    
    return Math.pow(sum, 1 / p);
  };
  
  /**
   * Returns the JavaScript object representation of the vector.
   *
   * @return {object}
   */
  proto.toObject = function() {
    var iterator, e, obj;
   
    iterator = this.iterator();
    e = iterator.next();
    obj = {};

    while (!e.done) {
      obj[e.value.index] = e.value.element;
      e = iterator.next();
    }
   
    return obj;
  };

  return SparseVector;
}));
