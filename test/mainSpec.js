describe('SparseVector', function() {
  var expect = require('chai').expect;
  var sv = require('../main');
  
  describe('{0: 5, 2: -12, 42: 0}', function() {
    var example;
    
    beforeEach(function() {
      example = sv({0: 5, 2: -12, 42: 0});
    });
    
    it('\'s length is 3', function() {
      expect(example.length()).to.equal(3);
    });
    
    it('can be traversed by the ECMAScript 6 iteration protocols', function() {
      var it1, it2, e;
      
      it1 = example.iterator();

      e = it1.next();
      expect(e.value).to.eql({index: 0, element: 5});
      expect(e.value).not.to.eql({index: 0, element: 5, pseudoprop: 42});
      expect(e).to.have.property('done', false);
      
      e = it1.next();
      expect(e.value).to.eql({index: 2, element: -12});
      expect(e).to.have.property('done', false);

      it2 = example.iterator();
      e = it2.next();
      expect(e.value).to.eql({index: 0, element: 5});
      expect(e).to.have.property('done', false);

      e = it1.next();
      expect(e.value).to.eql({index: 42, element: 0});
      expect(e).to.have.property('done', false);      
      
      e = it1.next();
      expect(e).to.have.property('done', true);   

      e = it1.next();
      expect(e).to.have.property('done', true);
    });
    
    it('dotted by a dense [] returns 0', function() {
      expect(example.dot([])).to.equal(0);
    });
    
    it('dotted by a 3-dim dense [10, 0, -1] returns 62', function() {
      expect(example.dot([10, 0, -1])).to.equal(62);
    });
    
    it('dotted by a 100-dim dense [10, 0, -1, ...] returns 62', function() {
      var dense = new Float64Array(100);
      dense[0] = 10;
      dense[1] = 0;
      dense[2] = -1;
      expect(example.dot(dense)).to.equal(62);
    });

    it('dotted by a sparse {0: 10, 2: -1, 100:100} returns 62', function() {
      var sparse = sv({0: 10, 2: -1, 1000: 3});
      expect(example.sdot(sparse)).to.equal(62);
    });

    it('added to [10, 0, -1] updates the dense to [15, 0, -13]', function() {
      var dense = [10, 0, -1];
      expect(example.addTo(dense)).to.eql([15, 0, -13]);
    });
    
    it('mutiplied by 2 and then added to [10, 0, -1] ' +
        'updates the dense to [20, 0, -25]', function() {
      var dense = [10, 0, -1];
      expect(example.addTo(dense, 2)).to.eql([20, 0, -25]);
    });

    it('\'s L0 norm is 2', function() {
      expect(example.l0()).to.be.closeTo(2, 2e-20);
    });
    
    it('\'s L1 norm is 17', function() {
      expect(example.l1()).to.be.closeTo(17, 2e-20);
    });
    
    it('\'s L2 norm is 13', function() {
      expect(example.l2()).to.be.closeTo(13, 2e-20);
    });

    it('\'s squared L2 norm is 169', function() {
      expect(example.l2sq()).to.be.closeTo(169, 2e-20);
    });
    
    it('\'s L-infinity norm is 12', function() {
      expect(example.linf()).to.be.closeTo(12, 2e-20);
    });
    
    it('\'s toObject() returns an object {0: 5, 2: -12, 42: 0}', function() {
      expect(example.toObject()).to.eql({0: 5, 2: -12, 42: 0});
    });
  });
  
  it('can be constructed with or without new keyword', function() {
    expect(sv({0: 3, 123512: 4}).lp(2)).to.be.closeTo(5, 2e-20); 
    expect(new sv({0: 3, 123512: 4}).lp(2)).to.be.closeTo(5, 2e-20);
  });
  
  it('Lp norm can be calculated by the method lp', function() {
    expect(sv({0: 3, 123512: 4}).lp(0.5)).to.be.closeTo(13.9282, 0.0001); 
    expect(sv({0: 3, 123512: 4}).lp(1)).to.be.closeTo(7, 2e-20); 
    expect(sv({0: 3, 123512: 4}).lp(2)).to.be.closeTo(5, 2e-20); 
    expect(sv({0: 3, 123512: 4}).lp(5)).to.be.closeTo(4.17403, 0.00001);

    expect(function() {sv({}).lp();}).to.
      throw(RangeError, 'first arg must be greater than 0');
    expect(function() {sv({}).lp(-1);}).to.
      throw(RangeError, 'first arg must be greater than 0');
    expect(function() {sv({}).lp(0);}).to.
      throw(RangeError, 'first arg must be greater than 0');
  });
  
  it('must be safely handled even if empty', function() {
    var example = sv({});
    expect(example.length()).to.equal(0);
    expect(example.dot([])).to.equal(0);
    expect(example.dot([1,2,3])).to.equal(0);
    expect(example.sdot(sv({}))).to.equal(0);
    expect(example.sdot(sv({0: 100, 2: 1000}))).to.equal(0);
    expect(example.l0()).to.equal(0);  
    expect(example.l1()).to.equal(0);
    expect(example.l2()).to.equal(0);
    expect(example.l2sq()).to.equal(0);
    expect(example.linf()).to.equal(0);
    expect(sv({}).lp(1)).to.equal(0);
    expect(sv({}).lp(2)).to.equal(0);
  });
});