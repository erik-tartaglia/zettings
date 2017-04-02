import {expect} from "chai";
import {stub, spy, SinonStub} from "sinon";
import EnvSource from "../../src/sources/src-env";
import {Options, Source} from "../../src/zettings";
import {setLoggerLevel, LVL_NONE} from '../../src/utils/simple-logger';

setLoggerLevel(LVL_NONE);

describe("EnvSource", function() {
  
  it("Assert that, by default, keys are joined by underscore and toUpperCase is called.", function() {
    const env: EnvSource = new EnvSource();
    process.env.TEST__KEY = "1";
    expect(env.get(["test", "key"])).to.be.equals("1");
    delete process.env.TEST__KEY;
  });


  it("Assert that changing the key separator has the expected effect.", function() {
    const env: EnvSource = new EnvSource({separatorToken: '3'});
    process.env.TEST3KEY = "1";
    expect(env.get(["test", "key"])).to.be.equals("1");
    delete process.env.TEST3KEY;
  });


  it("Assert that changing the the default letter case has the expected effect.", function() {
    const env1: EnvSource = new EnvSource({environmentCase: "lower"});    
    process.env.test__key = "1";
    expect(env1.get(["test", "key"])).to.be.equals("1");
    delete process.env.test__key;

    const env2: EnvSource = new EnvSource({environmentCase: "no_change"});
    process.env.TeSt__KeY = "2";
    expect(env2.get(["TeSt", "KeY"])).to.be.equals("2");
    delete process.env.TeSt__KeY;
  });


  it("Assert that the prefix will be applied.", function() {
    const env: EnvSource = new EnvSource({prefix: "custom"});
    process.env.CUSTOM__TEST__KEY = "1";
    expect(env.get(["test", "key"])).to.be.equals("1");
    delete process.env.CUSTOM__TEST__KEY;
  });


  it("Assert that the custom name will be used.", function() {
    const env: EnvSource = new EnvSource({name: "custom name"});    
    expect(env.name).to.be.equals("custom name");
  });


  it("Assert that each key segment could be used as a valid key.", function() {
    process.env['SEGMENT1__SEGMENT2__SEGMENT3'] = '13';
    process.env['SEGMENT1__OTHER'] = '12';
    const env: EnvSource = new EnvSource();

    expect(env.get(['SEGMENT1', 'SEGMENT2', 'SEGMENT3'])).to.be.equals('13');
    expect(env.get(['SEGMENT1', 'SEGMENT2'])).to.be.deep.equals({SEGMENT3: '13'});
    expect(env.get(['SEGMENT1'])).to.be.deep.equals({ SEGMENT2: {SEGMENT3: '13'}, OTHER: '12'});

    delete process.env['SEGMENT1__SEGMENT2__SEGMENT3'];
    delete process.env['SEGMENT1__OTHER'];
  });
  
});