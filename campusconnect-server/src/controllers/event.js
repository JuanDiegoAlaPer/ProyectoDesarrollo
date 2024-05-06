const bcrypt = require("bcryptjs");
const Event = require("../models/event");
const User = require("../models/user");
const multiparty = require("multiparty");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "proyectodesarrollo65@gmail.com",
    pass: "jlue olta qyfj ipih",
  },
});

const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error("Error al obtener evento:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

const createEvent = async (req, res) => {
  try {
    const eventData = req.body;
    const event = new Event({
      ...eventData,
      active: true,
      placesLeft: eventData.capacity,
    });

    const eventStored = await event.save();

    const eventDate = new Date(eventStored.date_at);
    eventDate.setDate(eventDate.getDate() + 1);
    const formattedDate = eventDate.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    let emailList = [];

    if (eventData.visibility.publico || eventData.visibility.uam) {
      const users = await User.find({ role: "user" });

      emailList = users.map((user) => user.email);
    } else {
      if (eventData.visibility.posgrados) {
        const users = await User.find({ role: "user", program: "posgrado" });

        emailList = users.map((user) => user.email);
      }
      if (eventData.visibility.pregrados) {
        const users = await User.find({ role: "user", program: "pregrado" });

        if (emailList.length > 0) {
          emailList = emailList.concat(users.map((user) => user.email));
        } else {
          emailList = users.map((user) => user.email);
        }
      }

      if (!(eventData.visibility.posgrados && eventData.visibility.pregrados)) {
        if (eventData.visibility.ingenieria) {
          const users = await User.find({
            role: "user",
            faculty: "ingenieria",
          });
          emailList = users.map((user) => user.email);
        }
        if (eventData.visibility.salud) {
          const users = await User.find({ role: "user", faculty: "salud" });
          if (emailList.length > 0) {
            emailList = emailList.concat(users.map((user) => user.email));
          } else {
            emailList = users.map((user) => user.email);
          }
        }
        if (eventData.visibility.estudiosSociales) {
          const users = await User.find({ role: "user", faculty: "ciencias" });
          if (emailList.length > 0) {
            emailList = emailList.concat(users.map((user) => user.email));
          } else {
            emailList = users.map((user) => user.email);
          }
        }
      }
    }

    const mailOptions = {
      from: "proyectodesarrollo65@gmail.com",
      to: emailList.join(","),
      subject: "Nuevo evento creado",
      html: `
        <h1>Detalles del nuevo evento</h1>
        <img src="cid:eventImage" alt="Imagen del evento"/>
        <p>Título: ${eventStored.evenTitle}</p>
        <p>Subtítulo: ${eventStored.eventSubtitle}</p>
        <p>Descripción: ${eventStored.eventDescription}</p>
        <p>Fecha: ${formattedDate}</p>
        <p>Lugar: ${eventStored.place}</p>
        <p>Capacidad: ${eventStored.capacity}</p>
      `,
      attachments: [
        {
          filename: `${eventStored.image}`,
          path: `./uploads/eventsImages/${eventStored.image}`,
          cid: "eventImage",
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error al enviar el correo:", error);
        return res
          .status(500)
          .json({ msg: "Error al enviar el correo electrónico" });
      }
      console.log("Correo electrónico enviado:", info.response);
      res.status(201).json(eventStored);
    });
  } catch (error) {
    console.error("Error al crear evento:", error);
    res.status(400).json({ msg: "Error al crear el evento" });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const eventData = req.body;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    const registeredUsersCount = await User.countDocuments({ events: id });
    const placesLeft = eventData.capacity - registeredUsersCount;

    if (placesLeft < 0) {
      return res.status(400).json({
        msg: "La capacidad debe ser igual o mayor a los usuarios ya inscritos",
      });
    }

    await Event.findByIdAndUpdate(id, eventData);
    await Event.findByIdAndUpdate(id, { placesLeft });

    const eventStored = await Event.findById(id);

    if (eventStored.active) {
      const eventDate = new Date(eventStored.date_at);
      eventDate.setDate(eventDate.getDate() + 1);
      const formattedDate = eventDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      let emailList = [];

      if (eventData.visibility.publico || eventData.visibility.uam) {
        const users = await User.find({ role: "user" });

        emailList = users.map((user) => user.email);
      } else {
        if (eventData.visibility.posgrados) {
          const users = await User.find({ role: "user", program: "posgrado" });

          emailList = users.map((user) => user.email);
        }
        if (eventData.visibility.pregrados) {
          const users = await User.find({ role: "user", program: "pregrado" });

          if (emailList.length > 0) {
            emailList = emailList.concat(users.map((user) => user.email));
          } else {
            emailList = users.map((user) => user.email);
          }
        }

        if (
          !(eventData.visibility.posgrados && eventData.visibility.pregrados)
        ) {
          if (eventData.visibility.ingenieria) {
            const users = await User.find({
              role: "user",
              faculty: "ingenieria",
            });
            emailList = users.map((user) => user.email);
          }
          if (eventData.visibility.salud) {
            const users = await User.find({ role: "user", faculty: "salud" });
            if (emailList.length > 0) {
              emailList = emailList.concat(users.map((user) => user.email));
            } else {
              emailList = users.map((user) => user.email);
            }
          }
          if (eventData.visibility.estudiosSociales) {
            const users = await User.find({
              role: "user",
              faculty: "ciencias",
            });
            if (emailList.length > 0) {
              emailList = emailList.concat(users.map((user) => user.email));
            } else {
              emailList = users.map((user) => user.email);
            }
          }
        }
      }

      const mailOptions = {
        from: "proyectodesarrollo65@gmail.com",
        to: emailList.join(","),
        subject: "Evento modificado",
        html: `
        <h1>Detalles del evento</h1>
        <img src="cid:eventImage" alt="Imagen del evento"/>
        <p>Título: ${eventStored.evenTitle}</p>
        <p>Subtítulo: ${eventStored.eventSubtitle}</p>
        <p>Descripción: ${eventStored.eventDescription}</p>
        <p>Fecha: ${formattedDate}</p>
        <p>Lugar: ${eventStored.place}</p>
        <p>Capacidad: ${eventStored.capacity}</p>
      `,
        attachments: [
          {
            filename: `${eventStored.image}`,
            path: `./uploads/eventsImages/${eventStored.image}`,
            cid: "eventImage",
          },
        ],
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error al enviar el correo:", error);
          return res
            .status(500)
            .json({ msg: "Error al enviar el correo electrónico" });
        }
        console.log("Correo electrónico enviado:", info.response);
        res.status(200).json({ msg: "Evento actualizado correctamente" });
      });
    }
    res.status(200).json({ msg: "Evento actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    res.status(400).json({ msg: "Error al actualizar el evento" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.status(200).json({ msg: "Evento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar evento:", error);
    res.status(400).json({ msg: "Error al eliminar el evento" });
  }
};

const getImage = async (req, res) => {
  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error al analizar formulario:", err);
      return res.status(500).json({ msg: "Error del servidor" });
    }

    const imageFile = files.imageFile[0];
    const tempPath = imageFile.path;
    const originalFileName = imageFile.originalFilename;
    const fileExtension = originalFileName.split(".").pop();
    const currentTime = new Date().getTime();
    const fileName = `${currentTime}_${originalFileName}`;

    const uploadDir = "../../uploads/eventsImages";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const targetPath = path.join(__dirname, uploadDir, fileName);

    fs.rename(tempPath, targetPath, async (err) => {
      if (err) {
        console.error("Error al mover archivo:", err);
        return res.status(500).json({ msg: "Error del servidor" });
      }

      res.status(200).json({ msg: "Imagen subida correctamente", fileName });
    });
  });
};

const giveImage = async (req, res) => {
  try {
    const { imageName } = req.params;

    const imagePath = path.join(
      __dirname,
      "../../uploads/eventsImages",
      imageName
    );

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ msg: "Imagen no encontrada" });
    }

    const image = fs.readFileSync(imagePath);

    res.writeHead(200, { "Content-Type": "image/png" });
    res.end(image, "binary");
  } catch (error) {
    console.error("Error al obtener imagen:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

const qualifyEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, userId, comment } = req.body;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    const newComment = {
      user: userId,
      message: comment,
      rating: rating,
    };

    event.comments.push(newComment);

    await event.save();

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    user.Qualified.push(id);
    await user.save();

    res.status(200).json({ msg: "Calificación agregada correctamente", event });
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    res.status(400).json({ msg: "Error al agregar la calificación al evento" });
  }
};

const postulateEvent = async (req, res) => {
  try {
    const eventData = req.body;

    const mailOptions = {
      from: "proyectodesarrollo65@gmail.com",
      to: "juandiegoap2000@gmail.com",
      subject: "Postulación para un evento",
      html: `
      <h1>Detalles del evento postulado</h1>
      <p>Nombre del evento: ${eventData.evenName}</p>
      <p>Fecha del evento: ${eventData.date_at}</p>
      <p>Capacidad del evento: ${eventData.capacity}</p>
      <p>Tema principal: ${eventData.mainTopic}</p>
      <p>Descripción del evento: ${eventData.eventDescription}</p>
      <h2>Información del solicitante:</h2>
      <p>Nombre: ${eventData.name}</p>
      <p>Correo electrónico: ${eventData.email}</p>
      <p>Teléfono: ${eventData.phone}</p>
      <p>Comentario adicional: ${eventData.comment}</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error al enviar el correo:", error);
        return res
          .status(500)
          .json({ msg: "Error al enviar el correo electrónico" });
      }
      console.log("Correo electrónico enviado:", info.response);
      res.status(200).json({ msg: "Evento postulado" });
    });
  } catch (error) {
    console.error("Error al crear evento:", error);
    res.status(400).json({ msg: "Error al crear el evento" });
  }
};

module.exports = {
  getEvent,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getImage,
  giveImage,
  qualifyEvent,
  postulateEvent,
};
