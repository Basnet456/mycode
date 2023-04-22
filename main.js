var arraytest = "";
var word = "";
var finalanswer;
var placeCount = [];
var formAnswer;
var queryString;
var value1;
var location1;
var location2;
var current_marker;
var del;
var key;
var start;

//apiキーを隠すための処理
var script = document.createElement("script");
script.src =
  "https://maps.googleapis.com/maps/api/js?key=AIzaSyCmBHBpNAvml90S32OJzv2zkJbEOdWWJhQ&language=ja&callback=initMap";
script.async = true;

//座標の変化を監視する
function watchPosition(position) {
  if (navigator.geolocation) {
    // 現在の位置情報を取得
    watchID = navigator.geolocation.watchPosition(
      // 位置情報の取得を成功した場合
      function (pos) {
        location1 = pos.coords.latitude;
        location2 = pos.coords.longitude;
        const icon = {
          url: "images/google-maps-current-location-icon-15.jpg", // url
          scaledSize: new google.maps.Size(50, 50), // scaled size
          origin: new google.maps.Point(0, 0), // origin
          anchor: new google.maps.Point(0, 0), // anchor
        };

        if (current_marker !== undefined) {
          current_marker.setMap(null);
        }

        current_marker = new google.maps.Marker({
          position: new google.maps.LatLng(location1, location2),
          map: map,
          //draggable:true,
          center: { lat: location1, lng: location2 },
          icon: icon,
        });
      }
    );
  } else {
    window.alert("Geolocationが使えません");
  }
}

const saveButton = document.getElementsByClassName("saveButton");

//新しい座標を追加する時に追加した座標をすぐに地図に反映するコード ページをreloadしている
function refreshPage() {
  setTimeout(function () {
    location.reload();
  }, 1000);
}

//get all data from firebase

db.collection("users")
  .get()
  .then((snapshot) => {
    snapshot.docs.map((doc) => {
      arraytest = doc.data().points;
      placeCount.push(arraytest);
      word += arraytest + ":";
    });

    watchPosition();
    initMap();
  });
//function initMap() {
window.initMap = function () {
  // Map option

  var options = {
    center: { lat: 35.1725302, lng: 136.8865799 },
    zoom: 14,
  };

  //New Map
  map = new google.maps.Map(document.getElementById("map"), options);

  //for
  for (i = 0; i < placeCount.length; i++) {
    var answer = word.split(/:/)[i];
    finalanswer = answer;
    var finalanswer = finalanswer.split(/,|\s/);

    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(finalanswer[0], finalanswer[1]),
      map: map,

      //draggable:true,
      //icon:'/scripts/img/logo-footer.png'
    });

    //マーカーをロングタップした場合の処理
    marker.addListener("mousedown", function (event) {
      key = event.latLng.lat() + "," + event.latLng.lng();
      start = new Date().getTime();
    });

    marker.addListener("mouseup", function (event) {
      if (start) {
        var end = new Date().getTime();
        var longpress = end - start < 500 ? false : true;

        if (longpress) {
          var result = window.confirm("マーカーをさくじょしますか？");

          if (result) {
            marker.setMap(null); //マーカー削除
            //Firestore削除
            // delete
            //firebase
            db.collection("users")
              .where("points", "==", key)
              .get()
              .then((snapshot) => {
                snapshot.docs.forEach((doc) => {
                  del = doc.id;
                });

                db.collection("users").doc(del).delete();
                refreshPage();
              });
          }
        }
      }
    });

    marker.addListener("click", function (e) {
      // data form firebase
      var touchPoint = e.latLng.lat() + "," + e.latLng.lng();

      //urlで座標を別のページに送る
      value1 = e.latLng.lat() + "," + e.latLng.lng();
      queryString = "?para1=" + value1;

      db.collection("users")
        .where("points", "==", touchPoint)
        .get()
        .then((snapshot) => {
          snapshot.docs.forEach((doc) => {
            formAnswer = doc.data().answers;
          });
          if (formAnswer && formAnswer.length > 0) {
            //座標に入っているアンケート結果を表示する

            var contentString_Show = `<h2>あんけーとのけっか</h2> <h3>おうちにいるひ</h3>
            <li>${formAnswer}</li>`;

            var infoWindow_Show = new google.maps.InfoWindow({
              content: contentString_Show,
            });

            infoWindow_Show.open(map, this);
          } else {
            infoWindow_Form.open(map, this);
          }
        });

      var contentString_Form = `<h1 id="firstHeading" class="firstHeading">あんけーとがめん</h1>
    <a href="./form.html?${queryString}" >にゅうりょく</a>`;

      var infoWindow_Form = new google.maps.InfoWindow({
        content: contentString_Form,
      });
    });
  }
};

//apiキーを隠すための処理
document.head.appendChild(script);
