const fs=require('fs'),p=require('path'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const root=p.resolve(__dirname,'..','..','..'),work=p.resolve(__dirname,'..','..');
const main='C:/Users/PuscedduD/Il mio Drive/Progetto FL APP/entilocaliapp',ts=require(p.join(main,'node_modules/typescript'));
const results=[];const record=(name,fn)=>Promise.resolve().then(fn).then(()=>results.push({name,status:'PASS',kind:'UNIT_SIMULATED_ADAPTER_NOT_API'}));
function load(file,imports){const text=fs.readFileSync(p.join(work,file),'utf8');const js=ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;let exports={};vm.runInNewContext(js,{exports,require:n=>{if(n in imports)return imports[n];throw Error('UNEXPECTED_IMPORT:'+n)},console:{error:()=>{}}},{timeout:2000});return exports;}
(async()=>{
const fn=load('src/application/userWorkflow.ts',{'../types.ts':{UserRole:load('src/domain/enums.ts',{}).UserRole}}).fetchUserRoleWorkflow;
for(const [name,response,expected] of [['admin',{data:'ADMIN'},'ADMIN'],['user',{data:'USER'},'USER'],['guest',{data:'GUEST'},'GUEST'],['finance',{data:'FINANCE'},'FINANCE'],['hr',{data:'HR'},'HR'],['auditor',{data:'AUDITOR'},'AUDITOR'],['absent',{data:null},'GUEST'],['invalid',{data:'admin'},'GUEST'],['lookup_error',{error:{code:'fail'}},'GUEST'],['exception',null,'GUEST']]){
await record('profile_'+name,async()=>{const calls=[];await fn({userRepository:{getUserRole:async()=>{if(response===null)throw Error('synthetic');return response;}}},{id:'artificial',role:'ADMIN'},x=>calls.push(x));assert.equal(calls.length,1);assert.equal(calls[0].payload.role,expected);assert.equal(calls[0].payload.id,'artificial');});
}
for(const method of ['update','delete'])for(const variant of ['success','zero','wrong_id','server_error','wrong_value']){
 await record(method+'_'+variant,async()=>{const error={code:'23514',message:'CLOSED synthetic'};let result={data:variant==='zero'?null:{id:variant==='wrong_id'?'other':'entity',name:variant==='wrong_value'?'wrong':'new'},error:variant==='server_error'?error:null};const chain={update:()=>chain,delete:()=>chain,eq:(key,id)=>{assert.equal(id,'entity');return chain;},select:()=>chain,maybeSingle:async()=>result};
 const C=load('src/infrastructure/persistence/SupabaseEntityRepository.ts',{'../../services/supabase':{supabase:{from:table=>{assert.equal(table,'entities');return chain;}}}}).SupabaseEntityRepository;
 const r=await new C()[method]('entity','new');const ok=variant==='success'||method==='delete'&&variant==='wrong_value';assert.equal(r.error===null,ok);if(variant==='server_error')assert.strictEqual(r.error,error);
 });}
fs.writeFileSync(p.join(root,'frontend-test-results.json'),JSON.stringify({runtime:process.version,typescript:ts.version,typescriptCompilerSHA256:crypto.createHash('sha256').update(fs.readFileSync(p.join(main,'node_modules/typescript/lib/typescript.js'))).digest('hex'),results},null,2));console.log(JSON.stringify({tests:results.length,pass:results.length}));
})().catch(e=>{console.error(e);process.exitCode=1;});
