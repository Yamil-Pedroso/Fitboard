import fn1 from "./images/fn_01.png";
import fn2 from "./images/fn_02.png";
import fn3 from "./images/fn_03.png";
import fn4 from "./images/fn_04.png";

// avatars
import avatar1 from "./images/avatars/avatar1.jpg";

interface IAssets {
  [key: string]: string;
}

const assets: IAssets = {
  fn1,
  fn2,
  fn3,
  fn4,
  avatar1,
};

export default assets;
