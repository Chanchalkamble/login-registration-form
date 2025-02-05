const express= require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;

app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static('public'))
app.get('/register', (req,res)=>{
    res.sendFile(__dirname + '/public/register.html')
});
app.get('/login' , (req,res) =>{
    res.sendFile(__dirname + '/public/login.html')
});
//middleware
app.use(session({
    secret: 'your-secret-key',
    resave:false,
    saveUninitialized:true
}));

 mongoose.connect('mongodb://localhost:27017/chanchal', {
    useNewUrlParser: true, // Use the new URL parser
    useUnifiedTopology: true // Use the new topology engine for MongoDB
})
 .then(()=>{
    console.log('connected')
 })
 .catch(()=>{
    console.log('not conneted' )
 });
  const userSchema = new mongoose.Schema({
    fullname:String,
    email:{type:String, unique:true},
    password:String
  });
  const ck = mongoose.model('ck', userSchema);
  app.get('/home', (req,res)=>{
    if(!req.session.user){
        return res.redirect('/login')
    }
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
         <head>
           <meta charset="UTF-8">
             <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>Home</title>
              <h2>Welcome, ${req.session.user.fullname}!</h2> 
             <p>You are logged in.</p>
               <a href="/logout">Logout</a> <!-- Logout link -->
            </div>
    </body>
        </html>
    `);
})
  app.post('/register', (req,res)=>{
    const{fullname, email,password}= req.body;
    const chanchal= ck({
        fullname, 
        email,
        password
    });
    chanchal.save()
    .then(()=>{
        res.send('registration successfully')
    })
    .catch(()=>{
        res.send('error registration' + error.message)
    })
  });
  app.post('/login', async (req,res)=>{
    const{email, password}= req.body;
    try{
        const user = await ck.findOne({email});
        if(!user){
            return res.send('User not found! <a href="/login">Try again</a>');
        }
        if(password === user.password){
            req.session.user = user;
            return res.redirect('/home');
        }
        else {
            return res.send('Incorrect password! <a href="/login">Try again</a>')
        }

    } catch (error) {
        console.error('Error logging in user:', error); // Log any errors
        res.send('Error logging in! <a href="/login">Try again</a>'); // Show generic error message
    }
  });
  app.get('/logout', (req, res) => {
    req.session.destroy((err) => { //Callback function that handles the response after attempting to destroy the session.
        if (err) {
            return res.send('Error logging out!'); // If session destruction fails, show error message
        }
        res.redirect('/login'); // Redirect to login page after successful logout
    });
});

app.listen(8080,()=>{
    console.log('server running at localhost:8080')
})