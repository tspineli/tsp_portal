var image = null;

// A variavel url deve ser configuravel
var url = 'https://comercial.certiface.com.br/CertiFaceWS';
var urlAuth = url + '/rs/operador/auth';
var urlCertiface = url + '/rs/certiface';

var title_noCamera = 'SEM PERMISSÕES DE ACESSO';
var subTitle_noCamera = 'Ocorreu um problema ao tentar abrir a câmera, verifique as permissões de acesso do seu browser ou dispositivo';
var desc_NoCameraSuporte = 'Este navegador não tem suporte de acesso a câmera.';

// Dados
var cpf = "35672664890";							// CPF com 11 digitos ex: 00000014141
var nome = "Tiago Spineli";						// Nome Sobrenome
var dataNascimento = "21/08/1986";
var nascimento = dataNascimento.substr(8,2) + '/' + dataNascimento.substr(5,2) + '/' + dataNascimento.substr(0,4);					// data de nascimento no formato 'dd/MM/yyyy'
console.log(nascimento);
var login = 'int.docusign.andre.hml';			// Login do operador
var pass = '26346cc196e983263b347ff3ef7b1469';  // Senha criptografada em MD5. ex linux: $ echo -n "password" | md5sum


$(function() {
    $('#divLoader').hide();
    $('#sectionVideo').show();
    $('#sectionImage').hide();

	// inicializa câmera de video.
	startCamera();

	$('#btnIniciar').click(function() {
		capturar();
	});

	$('#btnVoltar').click(function() {
		voltar();
	});

	$('#btnEnviar').click(function() {
		enviar();
	});
});

// start Camera HTML5
function startCamera() {
	navigator.getUserMedia =
		navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

	// get video element
	var video = document.getElementById('player');
	video.setAttribute('autoplay', '');
	video.setAttribute('muted', '');
	video.setAttribute('playsinline', '');

	// ajusta as configurações de video
	var constraints = {
		audio: false,
		video: {
			width: { exact: 640 },
			height: { exact: 480 }
		}
	};

	// se mobile, ajusta configurações de video para mobile
	if (isMobile()) {
		constraints = {
			audio: false,
			video: {
				width: { exact: 1280 },
				height: { exact: 720 },
				facingMode: 'user' // câmera frontal
			}
		};
	}

	// verifica suporte a getUserMedia
	if (navigator.getUserMedia) {
		// tenta abrir a câmera de video
		navigator.mediaDevices
			.getUserMedia(constraints)
			.then(function success(stream) {
				video.srcObject = stream;

				// exibe botão INICIAR
				$('#divButton').fadeIn();
				$('#divMsg').fadeIn(700, function() {
					window.setTimeout(function() {
						$('#divMsg').fadeOut(700, function() {});
					}, 1000);
				});

				// cria metodo stopCamera()
				window.stopCamera = function stopCamera() {
					stopCameraInternal(stream);
				};
			}).catch(function(err) {
				canContinue = false;
				addMessage('No camera! ' + err);
				swal({
						type: 'warning',
						title: title_noCamera,
						text: subTitle_noCamera,
						allowOutsideClick: false,
						allowEscapeKey: false,
						allowEnterKey: false
					},
					function() {
						location.reload();
					}
				);
			});
	} else {
		addMessage('getUserMedia not supported');
		swal({
				type: 'warning',
				title: title_NoCameraSupport,
				text: desc_NoCameraSuporte,
				allowOutsideClick: false,
				allowEscapeKey: false,
				allowEnterKey: false
			},
			function() {
				location.reload();
			}
		);
	}
}

// Capturar imagem da camera
function capturar() {
	// Guarda imagem em base64 na variavel image
	image = snap();

	// Exibe imagem capturada
	$('#sectionVideo').hide();
    $('#sectionImage').show();
    
    var canvas = document.getElementById('image_canvas');
    var ctx = canvas.getContext("2d");

    ctx.canvas.width = $('#innerImage')[0].clientWidth;
    ctx.canvas.height = $('#innerImage')[0].clientHeight;

    var img = new Image();
    img.onload = function() {
		// Desenha a imagem capturada no centro do canvas
        ctx.drawImage(img,
            canvas.width / 2 - img.width / 2,
            canvas.height / 2 - img.height / 2);
    };

    img.src = image;    
}

// Voltar para capturar nova imagem
function voltar() {
	$('#sectionVideo').show();
	$('#sectionImage').hide();
}

// captura imagem da câmera
function snap() {
	var video = document.querySelector('video');
	var canvas = document.getElementById('fc_canvas');
	var ctx = canvas.getContext('2d');

	ctx.canvas.width = 320;
    ctx.canvas.height = 480;
	
	// verifica proporção da imagem para fazer o Crop
	var ratio = video.videoWidth / video.videoHeight;
	var widthReal, heightReal = 0;
	var startX, startY = 0;

	if (ratio >= 1) {
		// paisagem
		widthReal = video.videoHeight / 1.5;
		heightReal = video.videoHeight;

		startX = (video.videoWidth - widthReal) / 2;
		startY = 0;
	} else {
		// retrato
		ratio = video.videoHeight / video.videoWidth;

		// verifica proporção
		if (ratio > 1.5) {
			widthReal = video.videoWidth;
			heightReal = video.videoWidth * 1.5;

			startX = 0;
			startY = (video.videoHeight - heightReal) / 2;
		} else {
			widthReal = video.videoHeight / 1.5;
			heightReal = video.videoHeight;

			startX = (video.videoWidth - widthReal) / 2;
			startY = 0;
		}
	}

	// Crop image video
	ctx.drawImage(video, startX, startY, widthReal, heightReal, 0, 0, ctx.canvas.width, ctx.canvas.height);

	var img = new Image();
	img.src = canvas.toDataURL('image/jpeg');

	return img.src;
}

function enviar() {
	$('#divLoader').show();
	$('#divButtonEnviar').hide();

	getToken(login, pass);
}

// verifica se o navegador é um dispositivo mobile
function isMobile() {
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		return true;
	}
	return false;
}

function addMessage(msg) {
	console.log(msg);
}

/*
 * Request para gerar token apartir de login e senha
 */
function getToken(login, senha) {
	var tokenDate;
	$.ajax({
		type: 'POST',
		url: urlAuth,
		crossDomain: true,
		headers: {
			'cache-control': 'no-cache',
			'content-type': 'application/x-www-form-urlencoded'
		},
		data: {
			login: login,
			senha: senha
		},
		success: function(response) {
			// Ex: 
			tokenDate = response;
			certiface(cpf, nome, nascimento, image, tokenDate);
		},
		error: function(response) {
			swal({
				type: 'warning',
				title: title_noCamera,
				text: 'Error getToken: Status cod: ' + response.status + ', Confira o login e senha.',
				allowOutsideClick: false,
				allowEscapeKey: false,
				allowEnterKey: false
			},
			function() {
				location.reload();
			}
		);
		}
	});

	return tokenDate;
}

/**
 * Gera uma nova assinatura, necessaria para o metodo **\/certiface**
 * @param {*} signature Credenciais de autorização obtido no metodo **\/Auth**
 */
function newSignature(signature){
	var token = signature.token;
	var expires = signature.expires;

	// Gera uma nova assinatura apartir das credenciais
	var textToSign = 'POST' + '/rs/certiface' + expires;
	var hash = CryptoJS.HmacSHA256(textToSign, token);
	var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
	var hashInBase64Safe = hashInBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
	var signature = login + ';' + hashInBase64Safe + ';' + expires;

	// Ex: {"token":"S8kvtTFOC6qHD3rV66-D3Qt5I3dvylIhqPj7LQCELQ8","expires":"09/12/2019 17:45:51"}
	var newSignature = { token: signature, date: new Date().toLocaleString('pt-BR') };

	return newSignature;
}

/**
 * 
 * @param {*} cpf CPF do cliente.
 * @param {*} nome Nome e Sobrenome do cliente.
 * @param {*} nascimento Data de nascimento do clinete (dd/MM/yyyy)
 * @param {*} imagem Imagem base64 do cliente
 * @param {*} signature Credenciais de autorização obtido no metodo **\/Auth**
 */
function certiface(cpf, nome, nascimento, imagem, signature) {
	/*
	var token = signature.token;
	var expires = signature.expires;

	// Gera uma nova assinatura apartir das credenciais
	var textToSign = 'POST' + '/rs/certiface' + expires;
	var hash = CryptoJS.HmacSHA256(textToSign, token);
	var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
	var hashInBase64Safe = hashInBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
	var signature = login + ';' + hashInBase64Safe + ';' + expires;

	// Ex: 
	var newSignature = { token: signature, date: new Date().toLocaleString('pt-BR') };
	*/
	
	newSignature = newSignature(signature);

	var formData = new FormData();
	var redirectDS;

	var settings = {
		"url": "https://ds-backend.azurewebsites.net/criaEnvelope",
		"method": "POST",
		"timeout": 0,
		"headers": {
		  "Content-Type": "application/json"
		},
		"data": JSON.stringify({
		  "NOME": localStorage.getItem("NOME"),
		  "EMAIL": localStorage.getItem("EMAIL"),
		  "CPF": localStorage.getItem("CPF")
		}),
	  };
	  
	  $.ajax(settings).done(function (response) {
		redirectDS = response;
		console.log(response);
	  });

	formData.append('cpf', cpf);
	formData.append('nome', nome);
	formData.append('nascimento', nascimento);
	formData.append('imagem', imagem.replace(/^data:image\/(png|jpeg);base64,/, ''));

	$.ajax({
		type: 'POST',
		url: urlCertiface,
		crossDomain: true,
		data: formData,
		contentType: false,
		processData: false,
		beforeSend: function(xhr) {
			console.log(newSignature);
			xhr.setRequestHeader('Authorization', newSignature.token);		// Header Authorization (Obrigatorio)
			xhr.setRequestHeader('X-Requested-Date', newSignature.date);	// Header Date (Obrigatorio)
		},
		success: function(response) {
			result = JSON.parse(response);

			var title = '';
			var msg = '';
			var icon = '';

			// result.status pode ser 'IDE', 'VAL' ou 'ERR'
			// 	* 'IDE' pode ser 'SUC' ou 'PEN'
			// 	* 'VAL' pode ser 'POS' ou 'NEG'
			//	* 'ERR' pode ser 'FAS'
			console.log(result);			

			switch (result.status) {
				case 'IDE':
					if (result.resultado == 'SUC') {
						title = 'Cadastro com sucesso';
						msg = 'Cadastro realizado com sucesso.';
						icon = 'success';
					} else if (result.resultado == 'PEN') {
						title = 'Cadastro com pendência';
						msg = 'Cadastro realizado com pendência. Existe um similar com CPF diferente.';
						icon = 'warning';
					}
					break;
				case 'VAL':
					if (result.resultado == 'POS') {
						title = 'Certificação positiva';
						msg = 'Certificação positiva.';
						icon = 'success';
					} else if (result.resultado == 'NEG') {
						title = 'Certificação negativa';
						msg = 'Certificação negativa. Face enviada não é a face cadastrada.';
						icon = 'warning';
					}
					break;
				case 'ERR':
					if (result.resultado == 'FAS') {
						title = 'Imagem recusada';
						msg = 'Imagem sem face ou com baixa qualidade para biometria.';
						icon = 'warning';
					} else {
						title = 'Erro';
						msg = 'Erro interno.';
						icon = 'error';
					}
					break;
				default:
					title = 'Erro';
					msg = 'Erro não previsto.';
					icon = 'error';
					break;
			}

			// Exibe resultado na tela
			swal({
					type: icon,
					title: title,
					text: msg,
					allowOutsideClick: false,
					allowEscapeKey: false,
					allowEnterKey: false
				},
				function() {
					
					console.log("result " + result.status);
					if((result.resultado == 'SUC') || (result.resultado == 'POS')){
						location.href = redirectDS.url;
					}else{
						location.reload();
					}
				}
			);
		},
		error: function(response) {
            swal({
					type: 'error',
					title: 'Atenção',
					text: 'Error getToken: Status cod: ' + response.status + ', Confira o login e senha.',
					allowOutsideClick: false,
					allowEscapeKey: false,
					allowEnterKey: false
				},
				function() {
					location.reload();
				}
			);
		}
	});
}
