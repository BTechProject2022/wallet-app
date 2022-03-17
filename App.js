import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import HomeScreen from "./src/screens/HomeScreen";
import { LogBox } from 'react-native';
import IssuerScreen from "./src/screens/IssuerScreen"
import QRScanScreen from "./src/screens/QRScanScreen"
import DocDisplayScreen from "./src/screens/DocDisplayScreen"
import DIDDisplayScreen from "./src/screens/DIDDisplayScreen"
import VerifierScreen from "./src/screens/VerifierScreen"
import DocSelectScreen from "./src/screens/DocSelectScreen"
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import { NavigationContainer } from '@react-navigation/native';

LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you\'re using an old API with gesture components, check out new Gestures system!",
  "Warning: componentWillReceiveProps has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.",
  "Face ID is not available in Expo Go. You can use it in a standalone Expo app by providing `NSFaceIDUsageDescription`."
]);

const navigator = createStackNavigator(
  {
    Home: HomeScreen,
    Issuer: IssuerScreen,
    Verifier: VerifierScreen,
    QRScan: QRScanScreen,
    DocDisplay: DocDisplayScreen,
    DIDDisplay: DIDDisplayScreen,
    DocSelect: DocSelectScreen
  },
  {
    initialRouteName: "Home",
    defaultNavigationOptions: {
      title: "Decentralized Identity",
    },
  }
);

// const Drawer = createDrawerNavigator();
// export default function App() {
// return (
//   <NavigationContainer>
//   <Drawer.Navigator initialRouteName="Home">
//   <Drawer.Screen name="Home" component={HomeScreen} />
//   <Drawer.Screen name="Settings" component={IssuerScreen} />
//   </Drawer.Navigator>
//   </NavigationContainer>
// );
// }

export default createAppContainer(navigator);
