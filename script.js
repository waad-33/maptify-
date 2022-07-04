'use strict';


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class  Workout {
    date = new Date();
    id= (Date.now() + '').slice(-10);
    click = 0;
    constructor(coords,distance,duration){
this.coords = coords;//[lat,lng]
this.distance=distance;//km
this.duration=duration;//min
    }

_setDiscription(){
    // prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()} ${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
}
click(){
    this.click ++ ;
}
}

class Running extends Workout{
    type = 'running';
    constructor(coords,distance,duration,cadence){
   super(coords,distance,duration);
   this.cadence= cadence;
   this.calcPace();
   this._setDiscription();

    }
    calcPace(){
        //min/km
        this.pace = this.duration / this.distance ;
        return this.pace ;
    }
}

class Cycling extends Workout{
    type='cycling';
constructor(coords,distance,duration,elevationGain){
    super(coords,distance,duration);
    this.elevationGain= elevationGain;
    this.calcSpeed();
    this._setDiscription();
}
calcSpeed(){
    //km/h
    this.speed = this.distance / (this.duration /60);
    return this.speed ;
}
}


///////////////////////////////////////////////////////////////////////////

class App{
#map;
#mapZoomLevel = 13 ;
#mapEvent ;
#workouts =[];
    constructor(){
        //get position
        this._getPostion();
        // get data from lical storage 
        this._getLocalStorage();

form.addEventListener('submit', this._newWorkout.bind(this));
inputType.addEventListener('change',this._toggleElevationField);
containerWorkouts.addEventListener('click',this._moveToPopup.bind(this));
    }

    _getPostion(){
        if(navigator.geolocation)
navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){alert(`coudn't find your locstion`)});
    }

    _loadMap(position){
            const {latitude,longitude} = position.coords 
              console.log(position);
          console.log(`https://www.google.com/maps/@${latitude},${longitude}`)
          
          const coords = [latitude,longitude];
          console.log(this);
           this.#map = L.map('map').setView(coords,this.#mapZoomLevel);
          console.log(this.#map);
          
          L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(this.#map);
          
          //handling click on map
              this.#map.on('click', this._showForm.bind(this));
              //render workout from localStorage
              this.#workouts.forEach(work => this._renderWorkoutMarker(work));
    }

    _showForm(mapE){
        this.#mapEvent = mapE ;
                  form.classList.remove('hidden');
                  inputDistance.focus();
    }
    _hideForm(){
        //clear inputs
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = '';
        //hide form
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(()=> (form.style.display='grid'),1000);
    }

    _toggleElevationField(){
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e){
        e.preventDefault();
//get data from the form 
const input = inputType.value ;
const distance = +inputDistance.value ;
const duration= +inputDuration.value ;
const{lat,lng} = this.#mapEvent.latlng ;
let workout;


const validInputs = (...inputs) => inputs.every(inpt => Number.isFinite(inpt));
const allPositive = (...inputs) => inputs.every(inpt => inpt >0 );


//if running ,create running obj
if(input === 'running'){
const cadence = +inputCadence.value;
//check if the data is valid
if(!validInputs(distance,duration,cadence) || !allPositive(distance,duration,cadence)) return alert('the input have to be positive num')

 workout = new Running([lat,lng],distance,duration,cadence);

}

// if cycling create new cycling obj 
if(input === 'cycling'){
    const elevation = +inputElevation.value;
    if(!validInputs(distance,duration,elevation)|| !allPositive(distance,duration))return alert('not positive num')
    workout = new Cycling([lat,lng],distance.duration,elevation)
   
    }
    
    this.#workouts.push(workout);
    console.log(this.#workouts);
// add the new activity to the workout array

//render workout on map as a marker
 this._renderWorkoutMarker(workout);

//render workout as a list 
this._renderWorkout(workout);
//hide form and clear input fields 
this._hideForm();

//set local storage to all workout
this._setLocalStorage();    

      
    }
    _renderWorkoutMarker(workout) {
        L.marker(workout.coords)
          .addTo(this.#map)
          .bindPopup(
            L.popup({
              maxWidth: 250,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: `${workout.type}-popup`,
            })
          )
          .setPopupContent(
            `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
          )
          .openPopup();
      }
    _renderWorkout(workout) {
        let html = `
          <li class="workout workout--${workout.type}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
              <span class="workout__icon">${
                workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
              }</span>
              <span class="workout__value">${workout.distance}</span>
              <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⏱</span>
              <span class="workout__value">${workout.duration}</span>
              <span class="workout__unit">min</span>
            </div>
        `;
    
        if (workout.type === 'running')
          html += `
            <div class="workout__details">
              <span class="workout__icon">⚡️</span>
              <span class="workout__value">${workout.pace.toFixed(1)}</span>
              <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">🦶🏼</span>
              <span class="workout__value">${workout.cadence}</span>
              <span class="workout__unit">spm</span>
            </div>
          </li>
          `;
    
        if (workout.type === 'cycling')
          html += `
            <div class="workout__details">
              <span class="workout__icon">⚡️</span>
              <span class="workout__value">${workout.speed.toFixed(1)}</span>
              <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⛰</span>
              <span class="workout__value">${workout.elevationGain}</span>
              <span class="workout__unit">m</span>
            </div>
          </li>
          `;
    
        form.insertAdjacentHTML('afterend', html);
      }
      _moveToPopup(e){
       const workoutEl = e.target.closest('.workout');
       if(!workoutEl) return;
       const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);
       console.log(workout);
       this.#map.setView(workout.coords, this.#mapZoomLevel, {
        animate: true,
        pan: {
          duration: 1,
        },
      });
      //using public interface 

      }
      ///local storage 
      _setLocalStorage(){
        localStorage.setItem('workouts',JSON.stringify(this.#workouts));
      }
      _getLocalStorage(){
        const data =JSON.parse(localStorage.getItem('workouts')) ;
        console.log(data);
        if(!data) return ;
        this.#workouts = data ;
        this.#workouts.forEach(work => this._renderWorkout(work));


      }
}
//create new obj 
const app = new App();




