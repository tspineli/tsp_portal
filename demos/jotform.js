const axios = require('axios');
const path = require('path');

async function form(req, res) {
  var tabs = '';
Object.keys(req.body).forEach(function(k){
    console.log(k + ' - ' + req.body[k]);
    tabs = tabs+ ',{"tabLabel": "'+k+'","value": "'+req.body[k]+'"}'
});
      res.send(tabs);
    };
  


async function dscall (req, res) {
  var tabs = '';
  Object.keys(req.body).forEach(function(k){
    console.log(k + ' - ' + req.body[k]);
    tabs = tabs+ ',{"tabLabel": "'+k+'","value": "'+req.body[k]+'"}'
});
  const body = '{"status": "sent","templateId": "'+req.body.templateid+'","templateRoles": [{"name": "'+req.body.name+'","roleName": "'+req.body.rolename+'","email": "'+req.body.email+'","tabs": {"textTabs": [{"tabLabel": "campo1","value": "1234"}'+tabs+']}}]}';
  const headers = {
    'Authorization': 'Bearer '+req.body.token,
    'Content-Type': 'application/json'
  };
  //const token = req.user;
  try {
    const response = await axios.post('https://demo.docusign.net/restapi/v2.1/accounts/'+req.body.accid+'/envelopes',body,{headers:headers});
    res.sendFile(path.join(__dirname, '../views/enviado.html'));
    //res.end(JSON.stringify(response.data));
  } catch (error) {
    res.end(error);

  }
}


async function teste (req, res) {
  res.sendFile(path.join(__dirname, '../views/enviado.html'));
}

module.exports = { form, dscall, teste };