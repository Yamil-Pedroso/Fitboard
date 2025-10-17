import fn1 from "./images/fn_01.png";
import fn2 from "./images/fn_02.png";
import fn3 from "./images/fn_03.png";
import fn4 from "./images/fn_04.png";

// avatars
import avatar1 from "./images/avatars/avatar1.jpg";

// icons
import icon1 from "./images/icons/icon_1.jpg";
import icon2 from "./images/icons/icon_2.jpg";
import icon3 from "./images/icons/icon_3.jpg";
import icon4 from "./images/icons/icon_4.jpg";
import icon5 from "./images/icons/icon_5.jpg";
import icon6 from "./images/icons/icon_6.jpg";

interface IAssets {
  [key: string]: string;
}

const assets: IAssets = {
  fn1,
  fn2,
  fn3,
  fn4,
  avatar1,
  icon1,
  icon2,
  icon3,
  icon4,
  icon5,
  icon6,
};

export default assets;
