// Gate analysis before sending a paper to an outdated worker. No paid request here.
export function analysisCapabilityError(health){
 const capabilities=health?.capabilities||[];
 if(!capabilities.includes('atlas-evidence-v1')||!capabilities.includes('atlas-candidate-v2'))return '分析服务仍是旧版，可能丢失侧别未报告的结构。请在“Kimi 连接”复制新版代码，替换 Cloudflare Worker 并 Deploy，然后测试连接。当前论文尚未发送。';
 if(!capabilities.includes('atlas-midline-v1'))return '分析服务尚不支持中线结构。请在“Kimi 连接”复制新版代码，替换 Cloudflare Worker 并 Deploy，然后测试连接。当前论文尚未发送。';
 return '';
}
