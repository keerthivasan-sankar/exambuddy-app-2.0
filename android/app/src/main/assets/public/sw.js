/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-17772b39'], (function (workbox) { 'use strict';

  self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "terms-and-conditions.html",
    "revision": "46df041558da87cf92232169c0305bca"
  }, {
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "privacy-policy.html",
    "revision": "374034262f578b4989fbaa88fc3c22d4"
  }, {
    "url": "moderation-policy.html",
    "revision": "8a34d5972dbad2f39bf305eb12f3f4ab"
  }, {
    "url": "index.html",
    "revision": "03992dea5a549c417bf0f4bb7fa3401f"
  }, {
    "url": "icon.png",
    "revision": "b8516f3978ecd839599ccfed95e87708"
  }, {
    "url": "icon-512.png",
    "revision": "65f4e41a43f2d4bc2ca9d4dc5e127f1e"
  }, {
    "url": "icon-192.png",
    "revision": "11b400bcda5bd64d155f00e3377f6278"
  }, {
    "url": "favicon.ico",
    "revision": "69276854bfe8a37f89a8b2b437051e20"
  }, {
    "url": "windows/Wide310x150Logo.scale-400.png",
    "revision": "027fbf29b541ccec5c15cdb75bcca17a"
  }, {
    "url": "windows/Wide310x150Logo.scale-200.png",
    "revision": "3576a979a794e7f8f83cc8a3a1605570"
  }, {
    "url": "windows/Wide310x150Logo.scale-150.png",
    "revision": "3624d06c43df642fdbd798b8e9f70e8f"
  }, {
    "url": "windows/Wide310x150Logo.scale-125.png",
    "revision": "f30c4ad75b705d259ac9f477c8fecb37"
  }, {
    "url": "windows/Wide310x150Logo.scale-100.png",
    "revision": "8c2f52179d444d8dd025b2f04c4d1ebe"
  }, {
    "url": "windows/StoreLogo.scale-400.png",
    "revision": "0c941f91bfd0c2db8a5ccdebfee78457"
  }, {
    "url": "windows/StoreLogo.scale-200.png",
    "revision": "89a8c0a8948742f220825c5840068b3d"
  }, {
    "url": "windows/StoreLogo.scale-150.png",
    "revision": "8cf3cfa796809fcfc55ba55ae2041a44"
  }, {
    "url": "windows/StoreLogo.scale-125.png",
    "revision": "9438ac46254d26a52d7ac97d9564176c"
  }, {
    "url": "windows/StoreLogo.scale-100.png",
    "revision": "a6bce6af61ed88a01b77edbadff962ec"
  }, {
    "url": "windows/Square44x44Logo.targetsize-96.png",
    "revision": "a271b52deca90b206746880e209d1004"
  }, {
    "url": "windows/Square44x44Logo.targetsize-80.png",
    "revision": "adcf87c4dda913051e055bc878fede37"
  }, {
    "url": "windows/Square44x44Logo.targetsize-72.png",
    "revision": "45838ca963fe4614774b7805c01673ac"
  }, {
    "url": "windows/Square44x44Logo.targetsize-64.png",
    "revision": "5017ca8e00201424655557bf8ff45d1e"
  }, {
    "url": "windows/Square44x44Logo.targetsize-60.png",
    "revision": "38643c51782967bc9fa4e3d7e8442d6a"
  }, {
    "url": "windows/Square44x44Logo.targetsize-48.png",
    "revision": "b66e15748b59afc327d7471d52add4a6"
  }, {
    "url": "windows/Square44x44Logo.targetsize-44.png",
    "revision": "85ec4cb3030810cd2021a424bf9b5d36"
  }, {
    "url": "windows/Square44x44Logo.targetsize-40.png",
    "revision": "8ee0ecbca44b90c297c0e1e81f8fea92"
  }, {
    "url": "windows/Square44x44Logo.targetsize-36.png",
    "revision": "22124ab08164e6ed210ba8af9c5b2df5"
  }, {
    "url": "windows/Square44x44Logo.targetsize-32.png",
    "revision": "103b042017d93ea0f20927b16fa20537"
  }, {
    "url": "windows/Square44x44Logo.targetsize-30.png",
    "revision": "1271f0f16f4d98abb96270903a54bf07"
  }, {
    "url": "windows/Square44x44Logo.targetsize-256.png",
    "revision": "ee2b7b2662016c83944827e362f96168"
  }, {
    "url": "windows/Square44x44Logo.targetsize-24.png",
    "revision": "5995eac3f708680670f0094c58f89ec3"
  }, {
    "url": "windows/Square44x44Logo.targetsize-20.png",
    "revision": "7cd3aeb2b9bf016d0f96d3d1d735fff9"
  }, {
    "url": "windows/Square44x44Logo.targetsize-16.png",
    "revision": "620daea4f1b49cea5cc664641c534c06"
  }, {
    "url": "windows/Square44x44Logo.scale-400.png",
    "revision": "7f99efd0d0a79b211c17d0c100a5dda1"
  }, {
    "url": "windows/Square44x44Logo.scale-200.png",
    "revision": "8b103e0e6a571e0c63dcaf9b5aec1c29"
  }, {
    "url": "windows/Square44x44Logo.scale-150.png",
    "revision": "c06bd8e512b8bff04336ed971728f9c7"
  }, {
    "url": "windows/Square44x44Logo.scale-125.png",
    "revision": "2830b350f963432915650072ce4e975c"
  }, {
    "url": "windows/Square44x44Logo.scale-100.png",
    "revision": "85ec4cb3030810cd2021a424bf9b5d36"
  }, {
    "url": "windows/Square44x44Logo.altform-unplated_targetsize-96.png",
    "revision": "5c5ae895f8f616aa3d9ad62e824ddee7"
  }, {
    "url": "windows/Square44x44Logo.altform-unplated_targetsize-80.png",
    "revision": "5ce417c1cc6e93c38b8177494ef745b3"
  }, {
    "url": "windows/Square44x44Logo.altform-unplated_targetsize-72.png",
    "revision": "17d4404280d54091c5182708e98ed54b"
  }, {
    "url": "windows/Square44x44Logo.altform-unplated_targetsize-64.png",
    "revision": "05a350a04dfc0df8a865c4451f8f92f0"
  }, {
    "url": "windows/Square44x44Logo.altform-unplated_targetsize-60.png",
    "revision": "53543afd9169e400dd14d44a8d424e21"
  }, {
    "url": "windows/Square44x44Logo.altform-unplated_targetsize-48.png",
    "revision": "147bcde8733d1b4ccdc92ad0d25b866a"
  }, {
    "url": "windows/Square44x44Logo.altform-unplated_targetsize-44.png",
    "revision": "4c7dd9239d420fcebbc13bccedf17249"
  }, {
    "url": "windows/Square44x44Logo.altform-unplated_targetsize-40.png",
    "revision": "4c3cddb22fb5b003fa7093c7f421f4f9"
  }, {
    "url": "windows/Square44x44Logo.altform-unplated_targetsize-36.png",
    "revision": "9ea8791d6e4bb5ef9964770e477640a5"
  }, {
    "url": "windows/Square44x44Logo.altform-unplated_targetsize-32.png",
    "revision": "d8f48d3102aeb7a87a0f823e91311b42"
  }, {
    "url": "windows/Square44x44Logo.altform-unplated_targetsize-30.png",
    "revision": "025edf2b51b024261864a5b72981a213"
  }, {
    "url": "windows/Square44x44Logo.altform-unplated_targetsize-256.png",
    "revision": "af709e1e75857bea2be7b1693508f71a"
  }, {
    "url": "windows/Square44x44Logo.altform-unplated_targetsize-24.png",
    "revision": "e233eeb8481aca0c38a46b4dac586ca4"
  }, {
    "url": "windows/Square44x44Logo.altform-unplated_targetsize-20.png",
    "revision": "9fdd000011b1ea3e372b8d9bac9caf22"
  }, {
    "url": "windows/Square44x44Logo.altform-unplated_targetsize-16.png",
    "revision": "2d437e66cbaadd03c0686f1e496155c8"
  }, {
    "url": "windows/Square44x44Logo.altform-lightunplated_targetsize-96.png",
    "revision": "5c5ae895f8f616aa3d9ad62e824ddee7"
  }, {
    "url": "windows/Square44x44Logo.altform-lightunplated_targetsize-80.png",
    "revision": "5ce417c1cc6e93c38b8177494ef745b3"
  }, {
    "url": "windows/Square44x44Logo.altform-lightunplated_targetsize-72.png",
    "revision": "17d4404280d54091c5182708e98ed54b"
  }, {
    "url": "windows/Square44x44Logo.altform-lightunplated_targetsize-64.png",
    "revision": "05a350a04dfc0df8a865c4451f8f92f0"
  }, {
    "url": "windows/Square44x44Logo.altform-lightunplated_targetsize-60.png",
    "revision": "53543afd9169e400dd14d44a8d424e21"
  }, {
    "url": "windows/Square44x44Logo.altform-lightunplated_targetsize-48.png",
    "revision": "147bcde8733d1b4ccdc92ad0d25b866a"
  }, {
    "url": "windows/Square44x44Logo.altform-lightunplated_targetsize-44.png",
    "revision": "4c7dd9239d420fcebbc13bccedf17249"
  }, {
    "url": "windows/Square44x44Logo.altform-lightunplated_targetsize-40.png",
    "revision": "4c3cddb22fb5b003fa7093c7f421f4f9"
  }, {
    "url": "windows/Square44x44Logo.altform-lightunplated_targetsize-36.png",
    "revision": "9ea8791d6e4bb5ef9964770e477640a5"
  }, {
    "url": "windows/Square44x44Logo.altform-lightunplated_targetsize-32.png",
    "revision": "d8f48d3102aeb7a87a0f823e91311b42"
  }, {
    "url": "windows/Square44x44Logo.altform-lightunplated_targetsize-30.png",
    "revision": "025edf2b51b024261864a5b72981a213"
  }, {
    "url": "windows/Square44x44Logo.altform-lightunplated_targetsize-256.png",
    "revision": "af709e1e75857bea2be7b1693508f71a"
  }, {
    "url": "windows/Square44x44Logo.altform-lightunplated_targetsize-24.png",
    "revision": "e233eeb8481aca0c38a46b4dac586ca4"
  }, {
    "url": "windows/Square44x44Logo.altform-lightunplated_targetsize-20.png",
    "revision": "9fdd000011b1ea3e372b8d9bac9caf22"
  }, {
    "url": "windows/Square44x44Logo.altform-lightunplated_targetsize-16.png",
    "revision": "2d437e66cbaadd03c0686f1e496155c8"
  }, {
    "url": "windows/Square150x150Logo.scale-400.png",
    "revision": "f11f6356d9c6611b00f71b146fc1ed47"
  }, {
    "url": "windows/Square150x150Logo.scale-200.png",
    "revision": "f95c85de426af82f63984bc19ee653d1"
  }, {
    "url": "windows/Square150x150Logo.scale-150.png",
    "revision": "da343e90929f603d9a783f26b3d2ad84"
  }, {
    "url": "windows/Square150x150Logo.scale-125.png",
    "revision": "97fff892a2efca594777e1589981dbbd"
  }, {
    "url": "windows/Square150x150Logo.scale-100.png",
    "revision": "3df57c3d16b5fcf1e7ec4e266877c98b"
  }, {
    "url": "windows/SplashScreen.scale-400.png",
    "revision": "3b0d665bf58c0150b74559d7e22dcef5"
  }, {
    "url": "windows/SplashScreen.scale-200.png",
    "revision": "027fbf29b541ccec5c15cdb75bcca17a"
  }, {
    "url": "windows/SplashScreen.scale-150.png",
    "revision": "867f6e2693dc981a8e237bb13f786363"
  }, {
    "url": "windows/SplashScreen.scale-125.png",
    "revision": "f77a5559510a35f5de7e441ec9d1b7c0"
  }, {
    "url": "windows/SplashScreen.scale-100.png",
    "revision": "3576a979a794e7f8f83cc8a3a1605570"
  }, {
    "url": "windows/SmallTile.scale-400.png",
    "revision": "4fdb20dd2c57b793140c0af9eb04c57e"
  }, {
    "url": "windows/SmallTile.scale-200.png",
    "revision": "274b77693fdf01975de4397d004344b2"
  }, {
    "url": "windows/SmallTile.scale-150.png",
    "revision": "ec271f6ae25e935bf38342de81fa7f9b"
  }, {
    "url": "windows/SmallTile.scale-125.png",
    "revision": "8b103e0e6a571e0c63dcaf9b5aec1c29"
  }, {
    "url": "windows/SmallTile.scale-100.png",
    "revision": "a61bf8609ae56302d202c9d7b03a9dc1"
  }, {
    "url": "windows/LargeTile.scale-400.png",
    "revision": "605daca693b3a60fbc1a5f439568bc73"
  }, {
    "url": "windows/LargeTile.scale-200.png",
    "revision": "879b9861e9c437a35a56c84c5af9e13a"
  }, {
    "url": "windows/LargeTile.scale-150.png",
    "revision": "4211f63c95bd6523c9cfa8e2a5925dd7"
  }, {
    "url": "windows/LargeTile.scale-125.png",
    "revision": "c2769af148151393f40a71980d0f0023"
  }, {
    "url": "windows/LargeTile.scale-100.png",
    "revision": "1975404233d4078591db0aa023c9dde6"
  }, {
    "url": "ios/87.png",
    "revision": "67759f9e1ae4c8ad42fad71a2b1dc5a1"
  }, {
    "url": "ios/80.png",
    "revision": "8c599e180e3656edac4d0ec408bf19b2"
  }, {
    "url": "ios/76.png",
    "revision": "fc2729f718fc3aa431d8e73a30c4c31f"
  }, {
    "url": "ios/72.png",
    "revision": "70dab2d8bfef180c7134202dbe99e0a6"
  }, {
    "url": "ios/64.png",
    "revision": "a3c012c1351cb3ca0f47e0ebcbb87fbf"
  }, {
    "url": "ios/60.png",
    "revision": "89894065c2e554fbf3e60d768c102caa"
  }, {
    "url": "ios/58.png",
    "revision": "a59550c2125371c0ad6855ed0c0da37e"
  }, {
    "url": "ios/57.png",
    "revision": "d88f741d8573e1426d0767f41dfe257e"
  }, {
    "url": "ios/512.png",
    "revision": "8478ebbaea7d5849675702061acc6090"
  }, {
    "url": "ios/50.png",
    "revision": "043b60749bb04b561a6baeed52ec0735"
  }, {
    "url": "ios/40.png",
    "revision": "4a1ee1d9f648f4d9b1ad3d91c7323956"
  }, {
    "url": "ios/32.png",
    "revision": "9315c5c0e145053503fe1d5791e27426"
  }, {
    "url": "ios/29.png",
    "revision": "41e26085dd83c3aa45d05d9a7e781065"
  }, {
    "url": "ios/256.png",
    "revision": "7b6600f4a4e8f474e6c1f09b03b307f0"
  }, {
    "url": "ios/20.png",
    "revision": "44089cc2beebae1d23e3f279b6e699d3"
  }, {
    "url": "ios/192.png",
    "revision": "355a3de20b78bb267441b5349dc23aed"
  }, {
    "url": "ios/180.png",
    "revision": "9021a6e9ab865ced7336420ab0837814"
  }, {
    "url": "ios/167.png",
    "revision": "1b2d5124a9b89bc8a573263bf07238f9"
  }, {
    "url": "ios/16.png",
    "revision": "41c4d5f9f4b9ed645bbcd879d76a85a3"
  }, {
    "url": "ios/152.png",
    "revision": "f560562a330370a8193ceee09d35c371"
  }, {
    "url": "ios/144.png",
    "revision": "4d3e6fb7bf878224ebd9e6efc3fac7b0"
  }, {
    "url": "ios/128.png",
    "revision": "1463abea8b15241fa09ca41edb21a836"
  }, {
    "url": "ios/120.png",
    "revision": "6fb6250b3c0cd2fba1dc64fd4251363e"
  }, {
    "url": "ios/114.png",
    "revision": "2bfdbc42eaf21864d3ed3d91ca4875b8"
  }, {
    "url": "ios/1024.png",
    "revision": "807a92238130a9b9ec2ec3a7bad57883"
  }, {
    "url": "ios/100.png",
    "revision": "e2be38965c23b4007846c5451744aa31"
  }, {
    "url": "assets/web-WNO_yzHX.js",
    "revision": null
  }, {
    "url": "assets/web-DqvmVCyD.js",
    "revision": null
  }, {
    "url": "assets/web-D9I3NIqx.js",
    "revision": null
  }, {
    "url": "assets/web-Cme0XwrN.js",
    "revision": null
  }, {
    "url": "assets/web-CjDq_uWe.js",
    "revision": null
  }, {
    "url": "assets/web-CfFrPCT9.js",
    "revision": null
  }, {
    "url": "assets/index-DJBYdekp.css",
    "revision": null
  }, {
    "url": "assets/index-CXQkHZtS.js",
    "revision": null
  }, {
    "url": "android/launchericon-96x96.png",
    "revision": "a271b52deca90b206746880e209d1004"
  }, {
    "url": "android/launchericon-72x72.png",
    "revision": "45838ca963fe4614774b7805c01673ac"
  }, {
    "url": "android/launchericon-512x512.png",
    "revision": "531abd8d25ebe098d17f5b96460ef5e5"
  }, {
    "url": "android/launchericon-48x48.png",
    "revision": "b66e15748b59afc327d7471d52add4a6"
  }, {
    "url": "android/launchericon-192x192.png",
    "revision": "63b61d721f4a68a27fe3426d475b0d32"
  }, {
    "url": "android/launchericon-144x144.png",
    "revision": "515c340a4f5ba44e467023b3b940c548"
  }, {
    "url": "favicon.ico",
    "revision": "69276854bfe8a37f89a8b2b437051e20"
  }, {
    "url": "icon-192.png",
    "revision": "11b400bcda5bd64d155f00e3377f6278"
  }, {
    "url": "icon-512.png",
    "revision": "65f4e41a43f2d4bc2ca9d4dc5e127f1e"
  }, {
    "url": "manifest.webmanifest",
    "revision": "20eef76343bf0847e979355c40712211"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/firestore\.googleapis\.com\/.*/i, new workbox.NetworkFirst({
    "cacheName": "firebase-data-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 100,
      maxAgeSeconds: 604800
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
