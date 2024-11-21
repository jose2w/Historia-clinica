document.getElementById('crearButton').addEventListener('click', function() {
    crearHistoriaClinica();
  });
  
  document.getElementById('consultarButton').addEventListener('click', function() {
    consultarHistoriaClinica();
  });
  
  document.getElementById('listarButton').addEventListener('click', function() {
    listarPacientes();
  });
  
  function crearHistoriaClinica() {
    window.location.href = 'crear.html';
  }
  
  function consultarHistoriaClinica() {
    window.location.href = 'consultar.html';
  }
  
  function listarPacientes() {
    window.location.href = 'listar.html';
  }