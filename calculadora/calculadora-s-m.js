function sumar(){
let N1 = document.getElementById("numero1").value;
let N2 = document.getElementById("numero2").value;
let resultado = Number(N1) + Number(N2);
document.getElementById("resultado: ").textContent="resultado: " + resultado;
}
function restar(){
let N1 = document.getElementById("numero1").value;
let N2 = document.getElementById("numero2").value;
let resultado = Number(N1) - Number(N2);
document.getElementById("resultado: ").textContent="resultado: " + resultado;
}
function multiplicacion(){
let N1 = document.getElementById("numero1").value;
let N2 = document.getElementById("numero2").value;
let resultado = Number(N1) * Number(N2);
document.getElementById("resultado: ").textContent="resultado: " + resultado;
}
function division(){
let N1 = document.getElementById("numero1").value;
let N2 = document.getElementById("numero2").value;
let resultado = Number(N1) / Number(N2);
document.getElementById("resultado: ").textContent="resultado: " + resultado;
}