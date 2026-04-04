import https from 'https';
import fs from 'fs';

const urls = [
  { name: 'MainDashboard.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2IxNzgwMWJkYjA3YjRjOTk5NTEyZWYyN2M2MmVkNjNkEgsSBxCixtTHnxsYAZIBIwoKcHJvamVjdF9pZBIVQhMzOTI3NzAxODcxOTA5Njg4MzY0&filename=&opi=89354086' },
  { name: 'SalesPipelineView.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2ZiNjM3ODk2NzJlNzQ5ZDA4ZGVkY2MyZDQwZjAzOTdmEgsSBxCixtTHnxsYAZIBIwoKcHJvamVjdF9pZBIVQhMzOTI3NzAxODcxOTA5Njg4MzY0&filename=&opi=89354086' },
  { name: 'SingleAgentDetailPage.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzQ2YjllNTJlYjg5MTRmZDM5NGY2NDM1NGU2Njg1MmMyEgsSBxCixtTHnxsYAZIBIwoKcHJvamVjdF9pZBIVQhMzOTI3NzAxODcxOTA5Njg4MzY0&filename=&opi=89354086' },
  { name: 'AgentBuilderCanvas.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2EzYmM2MWNlZThiZjQ5OTg4OTMyZTYyNTc5ZTBmNjcyEgsSBxCixtTHnxsYAZIBIwoKcHJvamVjdF9pZBIVQhMzOTI3NzAxODcxOTA5Njg4MzY0&filename=&opi=89354086' },
  { name: 'OnboardingSetupWizard.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzkzYjdjMGQ3ZDYyMDQ0ZmJiYzI3ZTU4NjNmNzBjNDZmEgsSBxCixtTHnxsYAZIBIwoKcHJvamVjdF9pZBIVQhMzOTI3NzAxODcxOTA5Njg4MzY0&filename=&opi=89354086' }
];

urls.forEach(item => {
  https.get(item.url, res => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      fs.writeFileSync('tmp/stitch/' + item.name, data);
      console.log('Downloaded ' + item.name);
    });
  });
});
