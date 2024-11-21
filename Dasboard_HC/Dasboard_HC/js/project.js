document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('fhirForm').addEventListener('submit', async function(event) {
        event.preventDefault();
    
        // Capturar los datos del formulario
        const patientNacionalidad = document.getElementById('patientNacionalidad').value;
        const typeDocumentPatient = document.getElementById('typeDocumentPatient').value;
        const patientDNI = document.getElementById('patientDNI').value;
        const patientName = document.getElementById('patientName').value;
        const patientLastName = document.getElementById('patientLastName').value;
        const patientBirthDate = document.getElementById('patientBirthDate').value;
        const patientSexo = document.getElementById('patientSexo').value;
        const patientGender = document.getElementById('patientGender').value;
        const patientOcupation = document.getElementById('patientOcupation').value;
        const patientDiscapacidad = document.getElementById('patientDiscapacidad').value;
        const patientResidentActual = document.getElementById('patientResidentActual').value;
        const patientMunipioActual = document.getElementById('patientMunipioActual').value;
        const patientPertEtnica = document.getElementById('patientPertEtnica').value;
        const patientZonaTerritorial = document.getElementById('patientZonaTerritorial').value;
        const patientEntidadRespondiente = document.getElementById('patientEntidadRespondiente').value;
        const typeEntryUser = document.getElementById('typeEntryUser').value;
        const historyAllergy = document.getElementById('historyAllergy').value;
    
        // Crear el recurso Patient en formato FHIR
        const patientResource = {
            resourceType: "Patient",
            identifier: [{
                system: "http://localhost:8080/patient-ids",
                value: patientDNI
            }],
            name: [{
                given: [patientName],
                family: patientLastName
            }],
            birthDate: patientBirthDate,
            gender: patientGender.toLowerCase(),
            extension: [
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/nationality",
                    valueString: patientNacionalidad
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/sex",
                    valueString: patientSexo
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/occupation",
                    valueString: patientOcupation
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/disability",
                    valueString: patientDiscapacidad
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/address",
                    valueAddress: {
                        country: patientResidentActual,
                        city: patientMunipioActual
                    }
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/ethnicity",
                    valueString: patientPertEtnica
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/residence-area",
                    valueString: patientZonaTerritorial
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/responding-entity",
                    valueString: patientEntidadRespondiente
                },
                {
                    url: 'http://localhost:8080/fhir/StructureDefinition/allergy-history',
                    valueString: historyAllergy
                },
                {
                    url: 'http://localhost:8080/fhir/StructureDefinition/type-entry-user',
                    valueString: typeEntryUser
                },
                {
                    url: 'http://localhost:8080/fhir/StructureDefinition/type-document-patient',
                    valueString: typeDocumentPatient
                }
            ]
        };
    
        // Enviar los datos al servidor FHIR
        try {
            const response = await fetch('http://localhost:8080/fhir/Patient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/fhir+json'
                },
                body: JSON.stringify(patientResource)
            });
    
    
            if (response.ok) {
                const data = await response.json();
                console.log('Success:', data);
                alert('Datos enviados con éxito');
                this.reset();
            } else {
                const errorText = await response.text(); // Capturar el texto del error
                console.error('Error:', errorText || response.statusText);
                alert(`Error al enviar los datos: ${errorText || response.statusText}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al enviar los datos');
        }
    });

}) 
