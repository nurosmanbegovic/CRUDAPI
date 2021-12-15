const express = require('express'),
      morgan = require("morgan"),
      fs = require("fs"),
      bodyParser = require("body-parser");
 

const reservationRoute=express.Router();



reservationRoute.get("/", (request, response) => {
    let reservations;

    fs.readFile('reservations.json', (err, data) => {
        if(err) throw err;
        reservations=JSON.parse(data);        
    response.json(reservations);
    });

});

reservationRoute.get("/:reservationId", (request, response) => {
    let reservations;
    let reservation;

    fs.readFile('reservations.json', (err, data) => {
        if(err) throw err;
        reservations=JSON.parse(data);
        reservations.periodic.forEach(element => {
            if(element.id == request.params.reservationId) reservation = element;
        });
    
    if(!reservation)  {
        response.status(404).json({message:'Reservation with this id does not exist'});
        return;
        }   
     else response.json(reservation);
    });

});



reservationRoute.post('/periodic', (request, response) => {
    let reservations;
    if(request.body.constructor === Object && Object.keys(request.body).length === 0) {
        response.status(404).json({message:'Reservation content can not be empty'});   
        return; 
    }
    fs.readFile('reservations.json', (err, data) => {
        if(err) throw err;
        reservations=JSON.parse(data);
                reservations.periodic.push(request.body);
                json = JSON.stringify(reservations, null, 4);
                fs.writeFile('reservations.json', json, {}, () => {
                response.json(reservations);
                });                
    });    
});

reservationRoute.put('/periodic/:reservationId', (request, response) => {
    let reservations;
    let reservation; 
    if(request.body.constructor === Object && Object.keys(request.body).length === 0) {
    response.status(404).json({message:'Reservation content can not be empty'}); 
    return;
}
    fs.readFile('reservations.json', (err, data) => {
        if(err) throw err;
        reservations=JSON.parse(data);
        reservations.periodic.forEach(element => {
            if(element.id == request.params.reservationId) {
                reservation = element;
                element.id = request.body.id;
                element.day = request.body.day;
                element.semester = request.body.semester;
                element.start = request.body.start;
                element.end = request.body.end;
                element.classroom = request.body.classroom;
                element.professor = request.body.professor;
            }
        })
        if(!reservation)  {
            response.status(404).json({message:'Reservation with this id does not exist'});
            return;
            }   
         else {
                json = JSON.stringify(reservations, null, 4);
                fs.writeFile('reservations.json', json, {}, () => {
                response.json(reservations);
                });       
            }         
    });    
});

reservationRoute.delete("/:reservationId", (request, response) => {
    let reservations;
    let reservation;

    fs.readFile('reservations.json', (err, data) => {
        if(err) throw err;
        reservations=JSON.parse(data);
        for(var i=0; i<reservations.periodic.length; i++) {
            if(reservations.periodic[i].id == request.params.reservationId){
                reservation = reservations.periodic[i];
                reservations.periodic.splice(i, 1);
                }
          }
          if(!reservation)  {
            response.status(404).json({message:'Reservation with this id does not exist'});
            return;
            }   
         else {
            json = JSON.stringify(reservations, null, 4);
            fs.writeFile('reservations.json', json, {}, () => {
            response.json(reservations);
            });       
         }               
            
        });   
    
    });

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


app.use('/api/reservations', reservationRoute);
let port = 8080;

app.listen(port, () => {
    console.log('Server is up and running on port number ' + port);
});