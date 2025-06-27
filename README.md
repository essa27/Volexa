
Volexa este o aplicație web completă pentru gestionarea sportivilor, meciurilor și a sălilor de antrenament si pentru crearea strategiilor de joc. Proiectul este dezvoltat folosind Angular pentru partea de frontend și Spring Boot pentru partea de backend.

Frontend – Angular
Pentru a rula aplicația frontend:

cd sportManagementFE
npm install
ng serve
Aplicația va fi disponibilă la adresa:
http://localhost:4200

Backend – Spring Boot
Pentru a porni serverul backend:

cd sportmanagement
./mvnw spring-boot:run
Serverul va rula pe adresa:
http://localhost:8080

Configurare bază de date
Fișierul de configurare se găsește la:
sportmanagement/src/main/resources/application.properties

Exemplu de configurare:

spring.datasource.url=jdbc:mysql://localhost:3306/volexadb
spring.datasource.username=root
spring.datasource.password=parola_ta
spring.jpa.hibernate.ddl-auto=update
Asigură-te că baza de date volexadb există în MySQL înainte de a porni backend-ul.
