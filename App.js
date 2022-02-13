import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import HomeScreen from "./src/screens/HomeScreen";
import { LogBox } from 'react-native';
import IssuerScreen from "./src/screens/IssuerScreen"
import QRScanScreen from "./src/screens/QRScanScreen"
import DocDisplayScreen from "./src/screens/DocDisplayScreen"
import DIDDisplayScreen from "./src/screens/DIDDisplayScreen"

LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you\'re using an old API with gesture components, check out new Gestures system!",
  "Warning: componentWillReceiveProps has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.",
  "Face ID is not available in Expo Go. You can use it in a standalone Expo app by providing `NSFaceIDUsageDescription`."
]);

const navigator = createStackNavigator(
  {
    Home: HomeScreen,
    Issuer: IssuerScreen,
    QRScan: QRScanScreen,
    DocDisplay: DocDisplayScreen,
    DIDDisplay: DIDDisplayScreen
  },
  {
    initialRouteName: "Home",
    defaultNavigationOptions: {
      title: "App",
    },
  }
);

export default createAppContainer(navigator);
