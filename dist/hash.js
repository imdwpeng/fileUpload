self.importScripts("/spark-md5.min.js"),self.onmessage=({data:e})=>{const{file:s}=e,a=new FileReader;a.readAsArrayBuffer(s),a.onload=e=>{const a=e.target.result,r=new self.SparkMD5.ArrayBuffer;r.append(a);const f=r.end(),n=/\.([0-9a-zA-Z]+)$/.exec(s.name)[1];self.postMessage({buffer:a,hash:f,suffix:n,filename:`${f}.${n}`})}};