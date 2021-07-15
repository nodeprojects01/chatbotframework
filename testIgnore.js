
function testing(){
    console.log(arguments.callee.name);
    console.log(__filename.slice(__dirname.length + 1, -3));
}

testing();