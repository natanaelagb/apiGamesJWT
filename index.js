const express = require("express");
const app = express();
const cors = require("cors");
const DB = require("./fakeDB");
const jwt = require("jsonwebtoken");
const JWTsecret = "qwerasdfzxcv";

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());


function auth(req, res, next) {
    const authToken = req.headers['authorization'];

    if(authToken != undefined){
        const bearer = authToken.split(" ");
        var token = bearer[1];

        jwt.verify(token, JWTsecret, (err, data) => {
            if(err){
                res.status(401);
                res.json(err);
            }else{
                req.token = token;
                req.loggedUser = {id: data.id, email: data.email};
                next();
            }
        })
        
    }else{
        res.status(401);
        res.json({err: "Token inválido"});
    }

}

app.post("/auth",(req, res) => {
    var {email, password} = req.body;

    if(email != undefined){
        var user = DB.user.find(user => user.email == email);

        if(user != undefined){
            if(user.password == password){
                jwt.sign({id: user.id, email: user.email}, JWTsecret, {expiresIn: "48h"}, (err, token) => {
                    if(err){
                        res.status(400);
                        res.json({err: "Falha interna."})
                    }else{
                        res.status(200);
                        res.json({token});
                    }
                })

            }else{
                res.status(401);
                res.json({err: "Senha inválida."});
            }
        }else{
            res.status(404);
            res.send("O email não existe no banco de dados.");
        }
    }else{
        res.status(400);
        res.send("O email é invalido!");
    }

})


app.get("/games", auth,(req, res) => {
   res.json({user: req.loggedUser, DB});
   res.status(200);
})

app.get("/game/:id", auth, (req, res) => {
    
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id);
        var game = DB.games.find(game => game.id == id);
        if(game == undefined)
            res.sendStatus(404);
        else
            res.json(game);
    }
})

app.post("/game", auth, (req, res) => {
    var {title, date, price} = req.body;
    DB.games.push({
        id: 4,
        title,
        date,
        price
    });

    res.sendStatus(200);
})

app.delete("/game/:id", auth, (req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id);
        var gameIndex = DB.games.findIndex(game => game.id == id);
        if(gameIndex == -1)
            res.sendStatus(404);
        else{
            DB.games.splice(gameIndex, 1);
            res.sendStatus(200);
        } 
    }
})

app.put("/game/:id", auth, (req, res) => {

    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id);
        var gameIndex = DB.games.findIndex(game => game.id == id);
        if(gameIndex == -1)
            res.sendStatus(404);
        else{
            var {title, date, price} = req.body;

            if(title != undefined){
                DB.games[gameIndex].title = title;
            }

            if(date != undefined){
                DB.games[gameIndex].date = date;
            }

            if(price != undefined){
                DB.games[gameIndex].price = price;
            }

            res.sendStatus(200);
        } 
    }



    res.sendStatus(200);
})

app.listen(80, ()=>{
    console.log("API games rodando");
})


