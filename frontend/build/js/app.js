// when the page is loaded
window.addEventListener('load', function () {
    // get all the inputs
    let inputs = document.getElementsByTagName('input');
    // focus the user in the first input
    console.log(inputs)
    if (inputs.length) inputs[0].focus();
});
