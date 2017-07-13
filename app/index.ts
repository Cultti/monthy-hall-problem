import {Server} from './server';

async function main() {
    let server = await Server.bootstrap();

    server.app.listen(8080, () => console.log("Listening now"));
}

main();


// Connect to mongoose
// mongoose.connect('mongodb://localhost/monthyhall').catch((err) => {
//     console.log(err.message);
// });


