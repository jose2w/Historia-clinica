async function fetchPatients() {
    try {
        // Realizar la solicitud al servidor FHIR
        const response = await fetch('http://localhost:8080/fhir/Patient');
        if (!response.ok) {
            throw new Error('Error al obtener pacientes del servidor FHIR.');
        }

        // Convertir la respuesta en JSON
        const data = await response.json();

        // Obtener el tbody de la tabla
        const patientsTableBody = document.querySelector('#patientsTable tbody');
        patientsTableBody.innerHTML = ''; // Limpiar la tabla antes de llenar

        // Verificar si hay pacientes en la respuesta
        if (data.entry && data.entry.length > 0) {
            data.entry.forEach((entry) => {
                const patient = entry.resource;

                // Extraer nombres y apellidos
                const name = patient.name && patient.name.length > 0 ? patient.name[0] : {};
                const givenName = name.given ? name.given.join(' ') : 'N/A';
                const familyName = name.family || 'N/A';

                // Extraer identificadores
                const identifier = patient.identifier && patient.identifier.length > 0 ? patient.identifier[0] : {};
                const idValue = identifier.value || 'N/A';

                // Buscar el tipo de documento en las extensiones
                let typeDocumentPatient = 'N/A';
                if (patient.extension) {
                    const docExtension = patient.extension.find(
                        (ext) =>
                            ext.url === 'http://localhost:8080/fhir/StructureDefinition/type-document-patient'
                    );
                    if (docExtension && docExtension.valueString) {
                        typeDocumentPatient = docExtension.valueString;
                    }
                }

                // Crear una fila para la tabla
                const rowHTML = `
                    <tr>
                        <td>${givenName}</td>
                        <td>${familyName}</td>
                        <td>${typeDocumentPatient}</td>
                        <td>${idValue}</td>
                    </tr>
                `;
                // Insertar la fila en la tabla
                patientsTableBody.insertAdjacentHTML('beforeend', rowHTML);
            });
        } else {
            // Mostrar un mensaje si no hay pacientes
            patientsTableBody.innerHTML = `
                <tr>
                    <td colspan="4">No se encontraron pacientes.</td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
        alert('Ocurrió un error al obtener los pacientes.');
    }
}

// Llamar a la función al cargar la página
document.addEventListener('DOMContentLoaded', fetchPatients);
