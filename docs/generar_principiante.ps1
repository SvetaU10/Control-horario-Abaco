from pathlib import Path
from docx import Document
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

out = Path(r"C:\Users\skatt\Desktop\cursor\docs\Resumen-Proyecto-Fichajes-principiante.docx")
doc = Document()

title = doc.add_heading("Explicación del proyecto de fichajes", 0)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER

for text, bold in [
    ("Autora: Svetlana", True),
    ("Tecnologías: PostgreSQL, Node.js, Express, TypeScript, HTML y JavaScript", False),
]:
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.bold = bold
    r.font.size = Pt(11)

def heading(text):
    doc.add_heading(text, 1)

def para(text):
    p = doc.add_paragraph(text)
    for r in p.runs:
        r.font.size = Pt(11)

heading("Introducción y objetivo")
para("Durante mis prácticas estoy desarrollando una aplicación web para registrar la jornada laboral de los empleados. La aplicación permite que cada trabajador inicie sesión y registre cuándo entra y cuándo sale de la empresa. Mi objetivo es aprender cómo se conectan una página web, un servidor y una base de datos.")
para("He dividido el proyecto en tres partes. La primera es el frontend, que es la parte que ve el usuario en el navegador. La segunda es el backend, que funciona como servidor y recibe las peticiones de la página web. La tercera es la base de datos, donde se guardan los usuarios y los fichajes.")

heading("Base de datos")
para("Para la base de datos estoy utilizando PostgreSQL. Decidí separar la información en varias tablas porque cada tabla representa una cosa diferente. De esta forma, el proyecto queda más ordenado y es más fácil de mantener.")
para("La tabla usuarios guarda los datos de cada empleado, como el nombre, los apellidos, el email, el rol, el centro de trabajo y el departamento. La contraseña no se guarda directamente. En su lugar se guarda un hash, que es un valor creado para proteger la contraseña real.")
para("La tabla fichajes guarda cada entrada y salida de los empleados. Cada registro indica qué usuario ha fichado, si es una entrada o una salida y la fecha y hora. La hora la genera el servidor, para evitar que el usuario pueda cambiarla desde su ordenador o teléfono.")
para("También preparé la tabla solicitudes_modificacion. Esta tabla se utilizará si un empleado olvida fichar. El empleado podrá explicar lo ocurrido y, en el futuro, una persona de Recursos Humanos podrá aprobar o rechazar la solicitud. Esta parte está preparada en la base de datos, pero todavía no es la prioridad del proyecto.")
para("Para hacer pruebas preparé el archivo seed.sql. Este archivo introduce datos de ejemplo: cinco usuarios, cinco fichajes y cinco solicitudes. Todos los usuarios de prueba tienen la contraseña Demo1234. Por ejemplo, puedo entrar como Ana con el email ana.martinez@empresa.com.")

heading("Docker")
para("Utilizo Docker para ejecutar PostgreSQL en un contenedor. Un contenedor es un entorno independiente que permite ejecutar un programa sin tener que instalarlo directamente de una forma complicada en el ordenador.")
para("En docker-compose.yml indiqué cómo debe iniciarse PostgreSQL. La base se llama fichajes_db y utiliza el puerto 5432. El archivo init.sql crea las tablas y el archivo seed.sql añade los datos de prueba. Para volver a cargar los datos de ejemplo utilizo npm run db:seed desde la carpeta backend.")

heading("Backend")
para("El backend está desarrollado con Node.js, Express y TypeScript. Su función es recibir las peticiones del frontend, aplicar las reglas del programa y comunicarse con la base de datos.")
para("Organicé el backend en varias capas. Las rutas reciben las peticiones, los servicios aplican las reglas de funcionamiento y los repositorios realizan las consultas SQL. Esta separación me ayuda a entender qué hace cada parte y evita mezclar todo el código en un solo archivo.")
para("El archivo index.ts es el punto de entrada del servidor. Su función es arrancar la aplicación. El archivo app.ts configura Express, permite recibir datos en formato JSON y registra las rutas. La API funciona en el puerto 3000.")
para("También añadí una ruta llamada /api/health. Esta ruta sirve para comprobar si el servidor está funcionando correctamente. Cuando se accede a ella, devuelve una respuesta indicando que todo está bien.")

heading("Login y JWT")
para("Para controlar el acceso utilizo JWT. Un JWT es un token, es decir, un código temporal que el servidor entrega después de comprobar correctamente el email y la contraseña del usuario.")
para("Cuando el usuario completa el formulario de login, el frontend envía sus datos al backend. El backend busca el usuario en la base de datos y compara la contraseña utilizando bcrypt. Si los datos son correctos, devuelve un token JWT.")
para("El frontend guarda el token en sessionStorage. Después, cada vez que el usuario hace una petición protegida, el frontend envía el token en la cabecera Authorization con el formato Bearer. El backend comprueba el token antes de permitir la operación.")
para("También existe una ruta llamada /api/auth/me, que permite obtener los datos del usuario que ha iniciado sesión. La contraseña nunca se devuelve al frontend.")

heading("API de fichajes")
para("La API tiene una ruta para registrar un fichaje, otra para consultar el último fichaje y otra para consultar el historial del usuario. Estas rutas utilizan el token para saber qué usuario está haciendo la petición.")
para("En el servicio de fichajes añadí una regla para evitar datos incorrectos. Si el último fichaje fue una entrada, el siguiente debe ser una salida. No se pueden registrar dos entradas seguidas ni dos salidas seguidas. Si ocurre, el servidor devuelve un error.")

heading("Frontend")
para("El frontend está dentro de la carpeta frontend y está creado con HTML, CSS y JavaScript. La página login.html contiene el formulario de acceso y login.js recoge los datos introducidos por el usuario.")
para("El archivo auth.js contiene las funciones relacionadas con el login, el token y las llamadas al backend. La pantalla index.html es la pantalla principal de fichaje y app.js controla sus botones y su historial.")
para("Para abrir la web utilizo serve.py, que crea un servidor local en el puerto 8090. La web se abre en http://localhost:8090/login.html. Es mejor utilizar este servidor que abrir directamente el archivo HTML, porque las llamadas del frontend al backend pueden fallar si se utiliza file://.")
para("Añadí también un popup para mostrar los mensajes que devuelve el servidor. Esto me permite saber si una operación ha funcionado o si hay algún error, por ejemplo cuando las credenciales son incorrectas.")

heading("Cómo ejecuto el proyecto")
para("Para ejecutar el proyecto primero inicio la base de datos con docker compose up -d db desde la carpeta backend. Después inicio el servidor con npm run dev. Finalmente, desde la carpeta frontend, ejecuto python serve.py. Cuando todo está encendido, abro http://localhost:8090/login.html en el navegador.")
para("Para probar el login utilizo el email ana.martinez@empresa.com y la contraseña Demo1234. Si el login es correcto, el servidor devuelve un token y la página permite acceder a la pantalla principal.")

heading("Problemas que he solucionado")
para("Durante el desarrollo encontré varios problemas. El servidor no arrancaba porque había una carpeta llamada index.ts en lugar de un archivo. También tuve que revisar cuál de los archivos init.sql utilizaba realmente Docker.")
para("Otro problema fue un error 401 al iniciar sesión. El error aparecía porque la contraseña guardada en los datos de prueba no coincidía con la contraseña que escribía en el formulario. Lo solucioné unificando la contraseña en Demo1234 y volviendo a cargar el seed.")
para("También aprendí que el frontend y el backend utilizan puertos diferentes. El backend funciona en el puerto 3000 y el frontend en el puerto 8090. Si el servidor del frontend está apagado, el navegador muestra que localhost ha rechazado la conexión.")

heading("Estado actual y siguientes pasos")
para("Actualmente tengo preparada la base de datos, los datos de ejemplo, el backend con Express, el login con JWT y las rutas principales de fichajes. El frontend ya puede comunicarse con el backend para iniciar sesión y guardar el token.")
para("El siguiente paso es terminar de conectar los botones de entrada y salida con la API. También tengo que conectar el historial para que los datos se lean desde PostgreSQL en lugar de depender del almacenamiento local del navegador. Después podré desarrollar la parte de administración y Recursos Humanos.")

# Use readable default spacing.
for section in doc.sections:
    section.top_margin = __import__('docx').shared.Cm(2.5)
    section.bottom_margin = __import__('docx').shared.Cm(2.5)

doc.save(out)
print(out)
