//This Aframe component provides orbit capability for a camera or rig entity using
//the oculus go and its controller. The component also enables the object to be
//changed via the trigger button. unfortunately, the objects are hard coded at this
//time using their entity id. 

// Registering component in oculus-go-orbit.js
AFRAME.registerComponent('oculus-go-orbit', {
  schema: {
    irad: {type: 'number', default: 10.0},
    maxrad: {type: 'number', default: 30.0},
    minrad: {type: 'number', default: 0.0},
    message: {type: 'string', default: 'Orbit ready!'},            //test message
    tpos: {type: 'vec3', default: new THREE.Vector3(0,0,0)},     //target position
    cpos: {type: 'vec3', default: new THREE.Vector3(0,0,10)},    //camera position
    index: {type: 'int', default: 0},                             //index of visible object
    deadzone: {type: 'number', default: 0.1},
    angularspeed: {type: 'number', default: 0.05},
    radialspeed: {type: 'number', default: 0.3},
    thetaphi: {type: 'boolean', default: true}
    
  },
  
  init: function () { 

       //object index for selection
       this.index = this.data.index;
       
       //add event listeners for the oculus go touchpad
       this.el.addEventListener('triggerdown', this.targetselection.bind(this));
       this.el.addEventListener("touchpaddown", this.phiOrR.bind(this));
       this.el.addEventListener("axismove", this.cameraOrbit.bind(this));
			  
  },
  
  // place holders for component methods
  update: function () {},
  tick: function (t,dt) {},
  remove: function () {},
  pause: function () {},
  play: function () {},

  // method for target selection
  targetselection: function(event) {  
    //get object index for array of viewable objects
    var index = this.data.index;
    // array of viewable objects; This could be automated or added to schema
    var objs = ['#mb','#prim', '#sq'];
    //get array of viewable objects
    var obj = document.querySelector(objs[index]);
    
    //this cycles through the targets making one visible at a time
    console.log("tester")
    obj.object3D.visible = false
    var i = index
    i++;
    index = i%objs.length;
    obj = document.querySelector(objs[index])
    obj.object3D.visible = true
    this.data.index = index;
    },
  
  //this method toggles the control form theta-phi to theta-r
  phiOrR: function(event){
    this.thetaphi = !this.thetaphi;
    console.log(this.thetaphi);
  },
  
  //This method provides teh orbital control
  cameraOrbit: function(event){

    //get information about entities that will be moved and will be the ojbect
    var el = document.querySelector('#rig');
    var cpos = el.object3D.position;
    var tpos =  this.data.tpos;
    var angSpeed = this.data.angularspeed;
    var radSpeed = this.data.radialspeed;
    var dz = this.data.deadzone;
    var thetaphi = this.thetaphi;
        
    //variables for camera in spherical coordinates
    let r = Math.sqrt(cpos.x**2+cpos.y**2+cpos.z**2);
    let theta = Math.asin(cpos.y/r);
    let phi = Math.atan(cpos.x/cpos.z);
    console.log(r,theta,phi);
    //variables for camera in cartesian coords
    let xp,yp,zp;
    
    if(event.detail.axis[1] <= -dz || event.detail.axis[1] >= dz){
         theta += event.detail.axis[1]*angSpeed;
         console.log("theta "+theta);
    } 
    
    if (thetaphi == true){   
      if(event.detail.axis[0] <= -dz || event.detail.axis[0]>= dz){
         phi += event.detail.axis[0]*angSpeed;
         console.log("phi "+event.detail.axis[0])
      }
    } else{ 
       if(event.detail.axis[0] <= -dz || event.detail.axis[0] >= dz){
         r += event.detail.axis[0]*radSpeed;
         console.log("r "+event.detail.axis[0])
       }     
    }
    
    //convert new position to cartesian coords
    xp = r*Math.cos(theta)*Math.sin(phi);
    yp = r*Math.sin(theta);
    zp = r*Math.cos(theta)*Math.cos(phi);  

    //move to new position, rotate to look at origin, rotate camera rig by pi
    el.object3D.position.set( xp, yp, zp );
    el.object3D.lookAt(tpos);
    el.object3D.rotateY(-3.14159);
  },
  
  //method to quickly change from radians to degrees
  todeg: function(x){
  return 180.*(x/3.14159);
} 

});

