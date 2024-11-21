 // Consulta datos del paciente por Numero de Identificacion
 document.getElementById('searchButton').addEventListener('click', function() {
    let patientDNIConsult = document.getElementById('patientDNIConsult').value.trim();

    if (patientDNIConsult === '') {
        alert('Por favor, ingrese un número de identificación válido.');
        return;
    }

    // Realizar la solicitud al servidor con el número de identificación como parámetro de búsqueda
    fetch(`http://localhost:8080/fhir/Patient?identifier=${patientDNIConsult}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('La solicitud no fue exitosa');
            }
            return response.json();
        })
        .then(data => {
            // Mostrar los datos del paciente
            displayPatientInfo(data);
        })
        .catch(error => {
            //console.error('Error al consultar los datos del paciente:', error);
            // Mostrar un mensaje de error al usuario
            alert("Identificación no registrada!");
            // Ocultar la sección de detalles del paciente en caso de error
            document.getElementById('patientDetails').classList.add('d-none');
            document.getElementById('editPatientFormContainer').classList.add('d-none');
            document.getElementById('patientDNIConsult').value = '';
        });
});


function displayPatientInfo(patientData) {
    const patientInfoDiv = document.getElementById('patientInfo');
    const observationContainer = document.getElementById('patientObservations');

    patientInfoDiv.innerHTML = '';

    for (const patient of patientData.entry) {
        const patientName = patient.resource.name[0].given.join(' ') + ' ' + patient.resource.name[0].family;
        const patientGender = patient.resource.gender;
        const patientBirthDate = patient.resource.birthDate;
        const patientNacionalidad = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/nationality');
        const patientDNI = patient.resource.identifier[0].value;
        const patientLastName = patient.resource.name[0].family;
        const patientSexo = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/sex');
        const patientOcupation = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/occupation');
        const patientDiscapacidad = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/disability');
        const patientResidentActual = getExtensionAddressValue(patient, 'http://localhost:8080/fhir/StructureDefinition/address', 'country');
        const patientMunipioActual = getExtensionAddressValue(patient, 'http://localhost:8080/fhir/StructureDefinition/address', 'city');
        const patientPertEtnica = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/ethnicity');
        const patientZonaTerritorial = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/residence-area');
        const patientEntidadRespondiente = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/responding-entity');
        const historyAllergy = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/allergy-history');
        const typeEntryUser = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/type-entry-user');
        const typeDocumentPatient = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/type-document-patient');

        const patientDetailsHTML = `
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Nombre:</strong> ${patientName}</p>
                    <p><strong>Género:</strong> ${patientGender}</p>
                    <p><strong>Fecha de Nacimiento:</strong> ${patientBirthDate}</p>
                    <p><strong>País de Nacionalidad:</strong> ${patientNacionalidad}</p>
                    <p><strong>Tipo de Identificación:</strong> ${typeDocumentPatient}</p>
                    <p><strong>Documento de Identificación:</strong> ${patientDNI}</p>
                    <p><strong>Apellidos:</strong> ${patientLastName}</p>
                    <p><strong>Antecedentes de Alergia:</strong> ${historyAllergy}</p>
                    <p><strong>Vía de ingreso del usuario al servicio de salud:</strong> ${typeEntryUser}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Sexo:</strong> ${patientSexo}</p>
                    <p><strong>Ocupación:</strong> ${patientOcupation ? patientOcupation : 'No especificado'}</p>
                    <p><strong>Categoría de Discapacidad:</strong> ${patientDiscapacidad ? patientDiscapacidad : 'No especificado'}</p>
                    <p><strong>País de Residencia:</strong> ${patientResidentActual ? patientResidentActual : 'No especificado'}</p>
                    <p><strong>Municipio de Residencia:</strong> ${patientMunipioActual ? patientMunipioActual : 'No especificado'}</p>
                    <p><strong>Pertenencia Étnica:</strong> ${patientPertEtnica ? patientPertEtnica : 'No especificado'}</p>
                    <p><strong>Zona Territorial:</strong> ${patientZonaTerritorial ? patientZonaTerritorial : 'No especificado'}</p>
                    <p><strong>Entidad Respondiente:</strong> ${patientEntidadRespondiente ? patientEntidadRespondiente : 'No especificado'}</p>
                </div>
                </div>
                <button type="button" class="btn btn-primary" id="editHistoryButton">Editar Historia Clinica</button>
                
            `;
            patientInfoDiv.innerHTML += patientDetailsHTML;

            // Mostrar las observaciones del paciente
            displayObservations(patient.resource.id);
        }

        // Mostrar la sección de detalles del paciente
        document.getElementById('patientDetails').classList.remove('d-none');

        // Agregar el evento de escucha al botón de editar historia
        document.getElementById('editHistoryButton').addEventListener('click', function() {
            document.getElementById('editPatientFormContainer').classList.remove('d-none');
        });
}

function getExtensionValue(patient, url) {
    const extension = patient.resource.extension.find(ext => ext.url === url);
    return extension ? extension.valueString : undefined;
}

function getExtensionAddressValue(patient, url, field) {
    const extension = patient.resource.extension.find(ext => ext.url === url);
    return extension && extension.valueAddress ? extension.valueAddress[field] : undefined;
}

// Función para enviar datos actualizados al servidor FHIR

document.getElementById('editPatientForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Obtener los valores de los campos del formulario
    const tipoDiagIngreso = document.getElementById('tipoDiagIngreso').value.trim();
    const observationText = document.getElementById('observationPatient').value.trim();
    const medications = document.getElementById('medicationsPatient').value.trim();
    const conditions = document.getElementById('conditionsPatient').value.trim();
    const patientDNIConsult = document.getElementById('patientDNIConsult').value.trim(); // Identificador del paciente

    if (!patientDNIConsult) {
        alert('Por favor, ingrese el número de identificación del paciente.');
        return;
    }

    if (!tipoDiagIngreso) {
        alert('Por favor, ingrese el diagnóstico principal.');
        return;
    }

    if (!observationText) {
        alert('Por favor, ingrese una observación.');
        return;
    }

    try {
        // Obtener los detalles del paciente utilizando el número de identificación
        const patientResponse = await fetch(`http://localhost:8080/fhir/Patient?identifier=${patientDNIConsult}`);
        if (!patientResponse.ok) {
            throw new Error('No se pudo encontrar el paciente');
        }
        const patientData = await patientResponse.json();
        const patientId = patientData.entry[0].resource.id;

        // Crear un objeto Observation en FHIR
        const observation = {
            resourceType: 'Observation',
            status: 'final',
            subject: {
                reference: `Patient/${patientId}`
            },
            component: [
                {
                    code: {
                        coding: [
                            {
                                system: 'http://loinc.org',
                                code: '18842-5', // Código para diagnóstico principal
                                display: 'Principal diagnosis'
                            }
                        ]
                    },
                    valueString: tipoDiagIngreso
                },
                {
                    code: {
                        coding: [
                            {
                                system: 'http://loinc.org',
                                code: '75325-1', // Código para observaciones
                                display: 'Observation comment'
                            }
                        ]
                    },
                    valueString: observationText
                },
                {
                    code: {
                        coding: [
                            {
                                system: 'http://loinc.org',
                                code: '29549-3', // Código para medicamentos
                                display: 'Current medication'
                            }
                        ]
                    },
                    valueString: medications
                },
                {
                    code: {
                        coding: [
                            {
                                system: 'http://loinc.org',
                                code: '75310-3', // Código para condiciones
                                display: 'Health conditions'
                            }
                        ]
                    },
                    valueString: conditions
                }
            ],
            effectiveDateTime: new Date().toISOString()
        };

        // Enviar la observación al servidor FHIR
        const response = await fetch('http://localhost:8080/fhir/Observation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/fhir+json'
            },
            body: JSON.stringify(observation)
        });

        if (response.ok) {
            const observationData = await response.json();
            console.log('Observation created:', observationData);
            alert('Datos enviados correctamente al servidor FHIR.');
            //document.getElementById('observationPatient').value = ''; 
            //document.getElementById('editPatientFormContainer').classList.add('d-none');
            console.log('Observation creada:', observationData);
            //displayPatientInfo(data);
            // Limpiar el formulario
            document.getElementById('editPatientForm').reset();

        } else {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al guardar la observación.');
            //console.error('Error creating Observation:', errorText || response.statusText);
            //alert(`Ha ocurrido un error al guardar la observación: ${errorText || response.statusText}`);
        }
    } catch (error) {
        console.error('Error al procesar los datos:', error);
        alert(`Error: ${error.message}`);
    }
});




function displayObservations(patientId) {
    fetch(`http://localhost:8080/fhir/Observation?subject=Patient/${patientId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('La solicitud no fue exitosa');
            }
            return response.json();
        })
        .then(observationData => {
            // Obtener el contenedor donde se mostrarán las observaciones
            const observationContainer = document.getElementById('observationContainer');
            // Limpiar el contenido anterior
            observationContainer.innerHTML = '';

            // Verificar si la respuesta contiene observaciones
            if (observationData.entry && observationData.entry.length > 0) {
                // Iterar sobre las observaciones y mostrarlas en la interfaz de usuario
                observationData.entry.forEach(observationEntry => {
                    const observation = observationEntry.resource;

                    // Extraer datos comunes
                    const components = observation.component || [];
                    const observationDateTime = observation.effectiveDateTime 
                        ? new Date(observation.effectiveDateTime) 
                        : observation.issued 
                        ? new Date(observation.issued) 
                        : null;

                    // Formatear fecha y hora
                    const observationDate = observationDateTime 
                        ? observationDateTime.toLocaleDateString() 
                        : 'Fecha no disponible';

                    const observationTime = observationDateTime 
                        ? observationDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                        : 'Hora no disponible';

                    // Buscar componentes específicos (diagnóstico, observaciones, medicamentos, condiciones)
                    const diagnosis = components.find(c => c.code.coding[0].code === '18842-5')?.valueString || 'No disponible';
                    const observationText = components.find(c => c.code.coding[0].code === '75325-1')?.valueString || 'No disponible';
                    const medications = components.find(c => c.code.coding[0].code === '29549-3')?.valueString || 'No disponible';
                    const conditions = components.find(c => c.code.coding[0].code === '75310-3')?.valueString || 'No disponible';

                    // Crear el HTML para mostrar cada observación
                    const observationHTML = `
                        <div class="observation">
                            <div class="date-time">
                                <p><strong>Fecha:</strong> 20/11/2024</p>
                                <p><strong>Hora:</strong> 14:35</p>
                            </div>
                            <p><strong>Diagnóstico principal:</strong> ${diagnosis}</p>
                            <p><strong>Observaciones:</strong> ${observationText}</p>
                            <p><strong>Medicamentos:</strong> ${medications}</p>
                            <p><strong>Condiciones:</strong> ${conditions}</p>
                        </div>
                    `;

                    // Agregar la observación al contenedor
                    observationContainer.insertAdjacentHTML('beforeend', observationHTML);
                });
            } else {
                // Mostrar un mensaje indicando que no hay observaciones disponibles
                const noObservationsHTML = `
                    <div class="no-observations">
                        <p>No se encontraron observaciones para este paciente.</p>
                    </div>
                `;
                observationContainer.insertAdjacentHTML('beforeend', noObservationsHTML);
            }
        })
        .catch(error => {
            console.error('Error al consultar las observaciones del paciente:', error);
            // Mostrar un mensaje de error al usuario
            alert('Ha ocurrido un error al recuperar las observaciones del paciente.');
        });
}

