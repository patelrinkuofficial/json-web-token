const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

app.get('/api',(req,res)=>{
    res.json({
        message : 'Welcome to API'
    });
});

app.post('/api/posts', verifyToken ,(req,res)=>{
    jwt.verify(req.token, 'secretkey',(err, authData) => {
        if(err){
            res.json('hello2');
        }else{
			const user = {
				id : 1,
				username : 'rinku123',
				email : 'rinku123@resolutesolutions.in'
			}
            res.json({
                message: 'Post created ...',
                authData : user
            });
        }
    })
    res.json({
        message : 'post to API'
    });
});

app.post('/api/login',(req,res)=>{
    // Mack User
    const user = {
        id : 1,
        username : 'rinku',
        mobileno : '9033939855'
    }
    /*jwt.sign({user:user},'secretkey', { expiresIn: '30s' } ,(err,token)=>{
        res.json({
            token : token
        })
    });*/
    jwt.sign({user:user},'secretkey',(err,token)=>{
        res.json({
            token : token
        })
    });
});

// Verify Tocken 
function verifyToken(req, res, next){
    //Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefine
    if(typeof bearerHeader !== 'undefined'){
        // split at the space 
        const bearer = bearerHeader.split(' ');
        // ge token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // next middleware
        next();
    }else{
        //res.json('hello1');
        next();
    }
}

app.listen(5000,()=>console.log('5000'));