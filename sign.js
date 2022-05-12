async function sign(req, res) {

    const axios = require('axios');
    let code = req.query.code;
   
    try {
      const url = 'https://ds-tsp-demo.azurewebsites.net/api/docusigntsp/authorizationcode?code='+code;
      const assinatura = await axios.get(url);
      res.redirect("https://demo.docusign.net/signing/signatureProvider/return?tspStatus=success&errorCode=&ti=");
    } catch (error) {
      res.end(error);
 
    }

  }

  async function auth(req,res){
    const axios = require('axios');
    const qs = require('qs');
    let code = req.query.code;
    var token = '';
   
    var data = qs.stringify({
      'grant_type': 'authorization_code',
     'code': code,
     'redirect_uri': 'https://ds-tsp.azurewebsites.net',
     'client_id': 'fb6f23a6-11db-4dc7-baec-3c85dd14c4fc',
     'client_secret': 'fe7f761f-e38c-4882-8fc4-a36686310088' 
     });
     console.log(data);
     var config = {
       method: 'post',
       url: 'https://account-d.docusign.com/oauth/token',
       headers: { 
         'Content-Type': 'application/x-www-form-urlencoded', 
         'Authorization': 'Basic ZmI2ZjIzYTYtMTFkYi00ZGM3LWJhZWMtM2M4NWRkMTRjNGZjO2ZlN2Y3NjFmLWUzOGMtNDg4Mi04ZmM0LWEzNjY4NjMxMDA4OA=='
       },
       data : data
     };

     try{
      let response = await axios(config);
      token = response.data.access_token;
     }
     catch(error){
      res.end(error);
     }


    var config2 = {
      method: 'get',
      url: 'https://demo.docusign.net/restapi/v2.1/signature/userinfo',
      headers: { 
        'Authorization': 'Bearer '+ token
      }
    };

    try{
      let response = await axios(config2);
      let nome = response.data.user.displayName;
      let email = response.data.user.email;
      res.render(__dirname + "/views/index",{nome:nome,email:email,code:code});
     }
     catch(error){
      res.end(error);
     }

  }

  module.exports = {sign,auth}; 