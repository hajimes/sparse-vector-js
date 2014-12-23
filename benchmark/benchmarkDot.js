/**
 * Copyright (c) 2014 Hajime Senuma
 * MIT License
 */

/* global console, Float64Array */
(function() {
  'use strict';

  var Benchmark = require('benchmark');
  var suite = new Benchmark.Suite();
  var sv = require('../');

  function generateRandomDense(dim) {
    var i, dense;
    dense = new Float64Array(dim);

    for (i = 0; i < dim; i += 1) {
      dense[i] = Math.random() * 1000;
    }
      
    return dense;
  }
  
  function generateRandomSparse(maxDim, maxSize) {
    var i, sparse, index;
    sparse = {};
    
    for (i = 0; i < maxSize; i += 1) {
      index = Math.floor(Math.random() * maxDim);
      sparse[index] = Math.random() * 1000;
    }
    
    return sparse;
  }

  function dotByMapWithKeys(sv, dv) {
    var sum = 0;

    Object.getOwnPropertyNames(sv).forEach(function(index) {
      sum += sv[index] * dv[index];
    });
    
    return sum;
  }
  
  function dotByMapWithDirectTraversal(sv, dv) {
    var index;
    var sum = 0;

    for (index in sv) {
      if (Object.prototype.hasOwnProperty.call(sv, index)) {
        sum += sv[index] * dv[index];
      }
    }
    
    return sum;
  }

  var dv = generateRandomDense(1000000);
  var mapSV = generateRandomSparse(1000000, 10000);
  var doubleArraySV = sv(mapSV);
  
  // add tests
  suite.add('map with keys', function() {
    dotByMapWithKeys(mapSV, dv);
  })
  .add('map with direct traversal', function() {
    dotByMapWithDirectTraversal(mapSV, dv);
  })
  .add('double array', function() {
    doubleArraySV.dot(dv);
  })
  .add('double array including construction', function() {
    doubleArraySV = sv(mapSV);
    doubleArraySV.dot(dv);
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  })
  .run({'async': true});
})();
