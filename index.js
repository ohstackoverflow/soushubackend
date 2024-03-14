const express = require('express');
const app = express();
var bodyParser = require('body-parser')
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(urlencodedParser);  //*****重要：否则，无法获取到post请求的url参数。


// create application/json parser
var jsonParser = bodyParser.json();

const cors = require('cors');
app.use(cors({
    origin: ['http://localhost:9517', 'https://ssvip.yesky.online', 'https://ss.yesky.online', 'https://xiaotusoushu.web.app']
}));


const AlipaySdk = require('alipay-sdk').default;
// TypeScript，可以使用 import AlipaySdk from 'alipay-sdk';
// 普通公钥模式
const alipaySdk = new AlipaySdk({
    appId: '2021004105625781',
    privateKey: process.env.ALI_PRV_KEY,
    alipayPublicKey: process.env.ALI_PBL_KEY,
});

var jwt = require("jsonwebtoken");
const secret = "secret4book";

app.get("/", async function(request, response) {
    console.log("alive.");
    response.json("Live");
});


//生成预订单、生成二维码
app.post('/createpayment', jsonParser, async function(request, response) {

    let qrCode = "";

    try {
        const result = await alipaySdk.exec('alipay.trade.precreate', {
            notify_url: process.env.CALLBACK_URL, // 通知回调地址
            bizContent: {
                out_trade_no: request.body.out_trade_no,
                total_amount: request.body.amount,
                subject: '小兔搜书'
            }
        });
        //console.log(result);
        qrCode = result.qrCode;
    } catch(e) {
        console.log("出错了");
        console.log(e);
    }

    console.log("-----------------------");

    response.json(qrCode);

});



//轮询检查payment
app.post('/checkpayment', jsonParser, async function(request, response) {

    const outTradeNo = request.body.out_trade_no;

    const resultPay = await alipaySdk.exec('alipay.trade.query', {
        bizContent: {
            out_trade_no: outTradeNo,
        }
    });

    console.log(resultPay.tradeStatus);
    const flag= resultPay.tradeStatus === "TRADE_SUCCESS";
    response.json(flag);

});


app.listen(process.env.PORT,() => console.log(('listening :)')))