var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

var Message = mongoose.model('Message',{
  name : String,
  message : String
})

var dbUrl = 'mongodb://lucas:12345@cluster0-shard-00-00.qr5jt.mongodb.net:27017,cluster0-shard-00-01.qr5jt.mongodb.net:27017,cluster0-shard-00-02.qr5jt.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-mhxmpv-shard-0&authSource=admin&retryWrites=true&w=majority'

app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})


app.get('/messages/:user', (req, res) => {
  var user = req.params.user
  Message.find({name: user},(err, messages)=> {
    res.send(messages);
  })
})


app.post('/messages', async (req, res) => {
  try{
    var message = new Message(req.body);

    var savedMessage = await message.save()
      console.log('saved');

    var censored = await Message.findOne({message:'badword'});
      if(censored)
        await Message.remove({_id: censored.id})
      else
        io.emit('message', req.body);
        if(message.message === "ezops"){
          message.name = 'auto'  
          message.message = 'resposta auto'
          io.emit('message', message);
        }  
      res.sendStatus(200);
  }
  catch (error){
    res.sendStatus(500);
    return console.log('error',error);
  }
  finally{
    console.log('Message Posted')
  }

})



io.on('connection', () =>{
  console.log('a user is connected')
})

mongoose.connect(dbUrl ,{useNewUrlParser: true, useUnifiedTopology: true} ,(err) => {
  console.log('mongodb connected',err);
})

var server = http.listen(3000, () => {
  console.log('server is running on port', server.address().port);
});
