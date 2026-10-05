import {mkdir,cp,writeFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const p of ['index.html','style.css','theatre.css','cinema.css','revelations.css','src','assets'])await cp(p,`dist/${p}`,{recursive:true});
await writeFile('dist/.nojekyll','');
console.log('Static site ready in dist/ (relative URLs; compatible with GitHub Pages subpaths).');

