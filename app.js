const userModel = firebase.auth();
const db = firebase.firestore();

const app = Sammy("#container", function () {
  this.use("Handlebars", "hbs");

  //Home routing

  this.get("#/home", function (context) {
    db.collection("clubs")
      .get()
      .then((response) => {
        context.clubs = response.docs.map((club) => {
          return { id: club.id, ...club.data() };
        });

        extendContext(context).then(function () {
          this.partial("./templates/home.hbs");
        });
      })
      .catch(errorHandler);
  });

  //User routing

  this.get("#/register", function (context) {
    extendContext(context).then(function () {
      this.partial("./templates/register.hbs");
    });
  });

  this.get("#/login", function (context) {
    extendContext(context).then(function () {
      this.partial("./templates/login.hbs");
    });
  });

  this.post("#/register", function (context) {
    const { email, password, repeatPassword } = context.params;

    if (email === "" || password !== repeatPassword || password.length < 6) {
      return;
    }

    userModel
      .createUserWithEmailAndPassword(email, password)
      .then((response) => {
        alert("Successful registration!");
        this.redirect("#/home");
      })
      .catch(errorHandler);
  });

  this.post("#/login", function (context) {
    const { email, password } = context.params;

    userModel
      .signInWithEmailAndPassword(email, password)
      .then((userData) => {
        saveUserData(userData);
        alert("Login successful.");
        this.redirect("#/home");
      })
      .catch(errorHandler);
  });

  this.get("#/logout", function (context) {
    userModel.signOut().then(() => {
      removeData();
      alert("Successful logout");
      this.redirect("#/login");
    });
  });

  //Movie routing

  this.get("#/addTeam", function (context) {
    extendContext(context).then(function () {
      this.partial("./templates/addTeam.hbs");
    });
  });

  this.post("#/addTeam", function (context) {
    const {
      title,
      description,
      firstPlayer,
      secondPlayer,
      thirdPlayer,
      imageUrl,
    } = context.params;

    db.collection("clubs")
      .add({
        title,
        description,
        firstPlayer,
        secondPlayer,
        thirdPlayer,
        imageUrl,
        creator: getUserData().uid,
        peopleLiked: [],
        likes: 0,
      })
      .then((response) => {
        alert("Created successfully!");
        this.redirect("#/home");
      })
      .catch(errorHandler);
  });

  this.get("#/edit/:clubId", function (context) {
    const { clubId } = context.params;

    db.collection("clubs")
      .doc(clubId)
      .get()
      .then((response) => {
        context.club = { id: clubId, ...response.data() };

        extendContext(context).then(function () {
          this.partial("./templates/edit.hbs");
        });
      })
      .catch(errorHandler);
  });

  this.post("#/edit/:clubId", function (context) {
    const {
      clubId,
      title,
      description,
      firstPlayer,
      secondPlayer,
      thirdPlayer,
      imageUrl,
    } = context.params;

    db.collection("clubs")
      .doc(clubId)
      .get()
      .then((response) => {
        return db
          .collection("clubs")
          .doc(clubId)
          .set({
            ...response.data(),
            title,
            description,
            firstPlayer,
            secondPlayer,
            thirdPlayer,
            imageUrl,
          });
      })
      .then((ress) => {
        alert("Edited successfully.");
        this.redirect(`#/details/${clubId}`);
      });
  });

  this.get("#/details/:clubId", function (context) {
    const { clubId } = context.params;

    db.collection("clubs")
      .doc(clubId)
      .get()
      .then((response) => {
        const { uid } = getUserData();

        const actualClub = response.data();

        const isIAmACreator = actualClub.creator === uid;

        const userIndex = actualClub.peopleLiked.indexOf(uid);

        const isILikeAClub = userIndex > -1;

        context.club = {
          ...actualClub,
          id: clubId,
          isIAmACreator,
          isILikeAClub,
        };

        extendContext(context).then(function () {
          this.partial("./templates/details.hbs");
        });
      });
  });

  this.get("#/delete/:clubId", function (context) {
    const { clubId } = context.params;

    db.collection("clubs")
      .doc(clubId)
      .delete()
      .then((response) => {
        alert("Deleted successfully.");
        this.redirect("#/home");
      })
      .catch(errorHandler);
  });

  this.get("#/like/:clubId", function (context) {
    const { clubId } = context.params;
    const { uid } = getUserData();

    db.collection("clubs")
      .doc(clubId)
      .get()
      .then((response) => {
        const clubData = { ...response.data() };

        clubData.peopleLiked.push(uid);
        clubData.likes++;

        return db.collection("clubs").doc(clubId).set(clubData);
      })
      .then((ress) => {
        alert("Liked successfully.");
        this.redirect(`#/details/${clubId}`);
      })
      .catch(errorHandler);
  });

  this.get("#/standing", function (context) {  
    extendContext(context)
        .then(function(){
            this.partial('./templates/standing.hbs')
        })
    // fetch('https://tipster.bg/klasirane/anglia', {mode: 'no-cors'})
    //     .then(response => response.text)
    //     .then(data => console.log(data))
        
        
  });

  this.get('#/search/:clubId', function(context){
      let text = document.getElementById('text')
      console.log(text.value)
  })


});

(() => {
  app.run("#/home");
})();

function extendContext(context) {
  const user = getUserData();

  context.isLoggedIn = Boolean(user);
  context.userEmail = user ? user.email : "";

  return context.loadPartials({
    header: "./partials/header.hbs",
    footer: "./partials/footer.hbs",
  });
}

function getUserData() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

function errorHandler(err) {
  alert(err);
}

function saveUserData(userData) {
  const {
    user: { email, uid },
  } = userData;

  localStorage.setItem("user", JSON.stringify({ email, uid }));
}

function removeData() {
  this.localStorage.removeItem("user");
}

function myClickFunction(context) {
    let input = document.getElementById('text')

    db.collection('clubs')
        .get()
}

