// Import required polyfills first
console.log("Importing polyfills");
import "fast-text-encoding";
console.log("Imported fast-text-encoding");
import "react-native-get-random-values";
console.log("Imported react-native-get-random-values");
import "@ethersproject/shims";
console.log("Imported @ethersproject/shims");
// Then import the expo router
import "expo-router/entry";
console.log("Imported expo-router");
