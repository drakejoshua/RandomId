// import the library code into the program
// use the StatefulElement class to do UI state changes and updates
import { StatefulElement } from './one.js';


// import the DOM objects used to represent elements for DOM manipulation
var genderSelect = document.getElementById('gender-select');

var profileCardImage = document.querySelector("div#profile > img"),
cardNameField = document.getElementById('name'),
cardEmailField = document.getElementById('email'),
cardLocationField = document.getElementById('location'),
cardGenderField = document.getElementById('gender'),
cardDOBField = document.getElementById('DOB'),
cardPhoneField = document.getElementById('phone'),
cardNationalityField = document.getElementById('nationality'),
cardIdField = document.getElementById('id'),
cardStroke = document.getElementsByTagName('rect')[0];


var generateBtn = document.getElementsByTagName('button')[0],
retryLink = document.getElementById('retry-link');

var mainElement = document.getElementsByTagName('main')[0];


// some util variable
const MICROINTERACTION_TIMING = 200;


// create a StatefulElement instance and state listener function
// for the <main> element in order to track it's UI state
var mainStatefulElement = new StatefulElement( mainElement, 
    { state: "loading" }
    , mainStateListener );

function mainStateListener( internalState, element ) {
    switch ( internalState.state ) {

        // for tracking the loading state
        // display the loading view
        case 'loading':
            element.classList.remove( "error", "load-success", 'loading' );
            element.classList.add("loading");

            
            cardStroke.style.strokeDashoffset = 1870;
        break;
        
        // for tracking the error state
        // display the error view
        case 'error':
            element.classList.remove( "error", "load-success", 'loading' );
            element.classList.add("error");
        break;
        
        // for tracking the load-success state
        // display the load successful view
        case 'load-success':
            element.classList.remove( "error", "load-success", 'loading' );
            element.classList.add("load-success");

            // display the card stroke/border micro-interaction
            setTimeout( function() {
                cardStroke.style.strokeDashoffset = 0;
            }, MICROINTERACTION_TIMING );

            // parse the fetched data into JSON from the original string format
            var cardData = JSON.parse( internalState.data );

            // check if there's an error on/from the API
            // [!]: if any error from the API, there'll be an error property in the parsed JSON object
            if ( cardData.error == null || cardData.error == undefined ) {

                // update the fields in the profile card to the values from the API
                cardGenderField.innerHTML = cardData.results[0].gender;
                cardNameField.innerHTML = `${ cardData.results[0].name.title } ${ cardData.results[0].name.first } ${ cardData.results[0].name.last }`;
                cardEmailField.innerHTML = `${ cardData.results[0].email }`;
                cardNationalityField.innerHTML = `${ cardData.results[0].nat }`;
                cardPhoneField.innerHTML = `${ cardData.results[0].phone }`;
                cardIdField.innerHTML = ( cardData.results[0].id.value != null ) ?
                    `${ cardData.results[0].id.name }, ${ cardData.results[0].id.value }` : `none`;

                // convert ISO date-string from API into acceptable format in our program
                var DOB = new Date( cardData.results[0].dob.date );
                cardDOBField.innerHTML = `${ DOB.toLocaleDateString() }`;

                cardLocationField.innerHTML = 
                  `${ cardData.results[0].location.street.number }, ${ cardData.results[0].location.street.name }` + 
                  `${ cardData.results[0].location.city }, ${ cardData.results[0].location.state }, ${ cardData.results[0].location.country }`;

                // set new src for the profile card image as gotten from the API
                profileCardImage.src = `${ cardData.results[0].picture.large }`;
            } else {

                // display the error view since there's an error from the API
                element.statefulRepresentation.internalState = { state: "error" };
            }
        break;

        default:
            console.log("invalid state encountered");
    }
}


// add event listeners for the generate button and retry link on both the data and error views
// respectively
generateBtn.addEventListener( 'click', generateAnotherId );
retryLink.addEventListener( 'click', generateAnotherId );

function generateAnotherId(){
    // display the loading view to showing loading status
    mainStatefulElement.internalState = { state: "loading" };

    // get the preferred gender selection from the <select>
    var preferredGender = genderSelect.value;

    // fetch json data from API based on preferred gender
    fetchRandomUser( preferredGender )
    .then( 
        function( data ) {
            mainStatefulElement.internalState = { state: "load-success", data: data };
        },

        function( reason ) {
            mainStatefulElement.internalState = { state: "error" };
        }
    );
}


// the fetchRandomUser()
// used to async fetch random user data as json from the random user API
// it returns a promise that represents the fetch action .. take note, the function uses the XMLHTTPRequest()
// so it uses the promise constructor syntax instead of the normal async/await
function fetchRandomUser( gender ) {

    // return promise made directly from it's constructor
    return new Promise( function( successCallback, faliureCallback ) {
        // start XMLHttpRequest 
        var xhr = new XMLHttpRequest();

        // initialize XMLHttpRequest based on preferred gender
        switch ( gender ) {
            case 'any':
                xhr.open( 'GET', 'https://randomuser.me/api/', true );
            break;
            
            case 'male':
                xhr.open( 'GET', 'https://randomuser.me/api/?gender=male', true );
            break;
            
            case 'female':
                xhr.open( 'GET', 'https://randomuser.me/api/?gender=female', true );
            break;
        }

        // set loading timeout on the XMLHttpRequest
        xhr.timeout = 5000;

        // send XMLHttpRequest to server
        xhr.send();

        // wait for XMLHttpRequest to load, settle as error or timeout then take action
        xhr.addEventListener( 'load', function() {

            // check if response was ok/properly successful and call proper callback
            if ( xhr.status == 200 ) {
                successCallback( xhr.response );
            } else {
                faliureCallback( "error" );
            }
        });
        
        xhr.addEventListener( 'timeout', function() {
            faliureCallback( "error" );
        });
        
        xhr.addEventListener( 'error', function() {
            faliureCallback( "error" );
        });
    })
}


// making the initial/priming fetch to read the first json data
fetchRandomUser('any')      // the fetch action
    .then( 
        function( data ) {
            // display the load successful view and update it with the loaded data
            mainStatefulElement.internalState = { state: "load-success", data: data };
        },

        function() {
            // display the error view due to error
            mainStatefulElement.internalState = { state: "error" };
        }
    );
