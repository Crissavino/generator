const mongoose = require("mongoose");
const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.DB_CNN, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    //Bind connection to error event (to get notification of connection errors)
    mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
    console.log("DB online");
  } catch (error) {
    console.error(error);
    throw new Error("Error en la conexion a la base de datos");
  }
};

module.exports = {
  dbConnection,
};
