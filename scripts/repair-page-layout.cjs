const fs=require('fs'),path=require('path'),{load}=require('cheerio');
function repair(){
 const root=path.resolve(__dirname,'..');
 // Source anchor placeholders precede the content; bind navigation to the actual headings.
 const alarmFile=path.join(root,'public/alarm-monitoring/index.html'),alarm=load(fs.readFileSync(alarmFile,'utf8'));
 for(const [label,id]of [['Alarm Monitoring','AlarmMonitoringandPatrolService'],['Electronic Security Maintenance','MaintenanceandServicing']]){
 const heading=alarm('.editorial-content h2').filter((i,e)=>alarm(e).text().trim()===label).first();if(!heading.length)throw Error('Missing heading '+label);
 const old=heading.attr('id');alarm('[id]').filter((i,e)=>alarm(e).attr('id')===id).not(heading).removeAttr('id');heading.attr('id',id).addClass('section-anchor');
 if(old)alarm('.page-toc a').filter((i,e)=>alarm(e).attr('href')==='#'+old).attr('href','#'+id);
 if(label==='Electronic Security Maintenance'){const block=heading.closest('.editorial-block'),image=block.prev('.editorial-image');if(image.length)block.after(image);}
 }
 fs.writeFileSync(alarmFile,alarm.html().split('\n').map(s=>s.trimEnd()).join('\n').trimEnd()+'\n');
 for(const name of ['about','contact']){
 const file=path.join(root,'public',name,'index.html'),$=load(fs.readFileSync(file,'utf8'));
 if(name==='about'){
  for(const [label,id]of [['Our Values','OurValues'],['Our Story','OurStory']]){const target=$('.editorial-content h2,.editorial-content h3').filter((i,e)=>$(e).text().trim()===label).first();if(!target.length)throw Error('Missing heading '+label);const old=target.attr('id');$(`[id="${id}"]`).not(target).removeAttr('id');target.attr('id',id).addClass('section-anchor');if(old)$('.page-toc a').filter((i,e)=>$(e).attr('href')==='#'+old).attr('href','#'+id);}
 }else{
  // Drop the old imported contact block, its bare hours labels and source-form success text.
  const duplicates=new Set(['Contact Details','(07) 55 888 111','101 Ashmore Rd, Bundall QLD 4217','24/7 Emergency Locksmiths or Electronic Security','Trade COunter Hours','Retail Showroom Hours','Get A Free Quote Now!','Thank you for contacting SPL Security Solutions.','We will be in touch soon']);
  $('.editorial-content>.editorial-block').each((i,e)=>{if(duplicates.has($(e).text().replace(/\s+/g,' ').trim()))$(e).remove();});
  $('.editorial-content>.editorial-image').each((i,e)=>{if(/\/social-media\//.test($(e).find('img').attr('src')||''))$(e).remove();});
  $('span.section-anchor').each((i,e)=>{if(/^https?:/.test($(e).attr('id')||''))$(e).remove();});
  $('.contact-socials').remove();
  const socials=[['facebook','SPL on Facebook','https://www.facebook.com/splsecurity'],['instagram','SPL on Instagram','https://www.instagram.com/spl_security/'],['localsearch','SPL business listing','https://www.localsearch.com.au/profile/spl-security-solutions/bundall-qld/FSwF'],['gmb','Find SPL on Google Maps','https://maps.app.goo.gl/gMTHmoGATMh5Bm7XA'],['linkedin','SPL on LinkedIn','https://au.linkedin.com/company/spl-security']];
  $('.business-hours').append(`<div class="contact-socials" aria-label="SPL social and business profiles">${socials.map(([icon,label,url])=>`<a href="${url}" aria-label="${label}" rel="noopener noreferrer"><img src="../assets/social-${icon}.svg" alt="${label}" width="36" height="36" loading="lazy"></a>`).join('')}</div>`);
  $('.business-hours').after($('.contact-draft'));
  // Reconcile contents links with the new content order and remove the deleted section link.
  $('.page-toc>div').empty();$('.editorial-content h2,.editorial-content h3').slice(0,12).each((i,e)=>{let id=$(e).attr('id');if(!id){id='contact-section-'+i;$(e).attr('id',id);}$('.page-toc>div').append($('<a></a>').attr('href','#'+id).text($(e).text().trim()));});
 }
 $('link[href*="seo.css"]').attr('href','../seo.css?v=20261015-contact-2');
 fs.writeFileSync(file,$.html().split('\n').map(s=>s.trimEnd()).join('\n').trimEnd()+'\n');
 }
}
module.exports=repair;if(require.main===module){repair();console.log('Repaired About anchors and Contact layout.');}
