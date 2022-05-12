const axios = require('axios');

async function newenv (req, res) {
  const reqbody = JSON.stringify(req.body);
  const reqheader = req.headers.authorization;
  var accid = '';
  
  const body = reqbody;
  const headersuser = {
    'Authorization': reqheader
  };
  const headers = {
    'Authorization': reqheader,
    'Content-Type': 'application/json'
  };

  try {
    const userinfo = await axios.get('https://account-d.docusign.com/oauth/userinfo',{headers:headersuser});
    accid = userinfo.data.accounts[0].account_id;
    console.log(accid);
  } catch (error) {
    res.end(error);

  }


  try {
    const response = await axios.post('https://demo.docusign.net/restapi/v2.1/accounts/'+accid+'/envelopes',body,{headers:headers});
    res.end(JSON.stringify(response.data));
  } catch (error) {
    res.end(error);

  }
}


module.exports = { newenv };