const mongoose = require("mongoose")
const app = require("./app")
const dotenv = require('dotenv').config()

app.get(`/api/${process.env.API_VERSION}/auth`, (req, res)=> res.send('Holi'));

console.log(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`);
mongoose
    .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Conexión a la base de datos exitosa");

        app.listen(process.env.PORT, () => {
            console.log("######################");
            console.log("###### API REST ######");
            console.log("######################");

            console.log(`http://${process.env.IP_SERVER}:${process.env.PORT}/api/${process.env.API_VERSION}`);
        });
    })
    .catch((error) => {
        console.error("Error conectando a la base de datos:",error);
    });