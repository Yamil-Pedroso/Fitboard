import assets from "../../assets";
import { motion } from "framer-motion";

const iconImages = [
  {
    src: assets.icon1,
    alt: "Icon 1",
  },
  {
    src: assets.icon2,
    alt: "Icon 2",
  },
  {
    src: assets.icon3,
    alt: "Icon 3",
  },
  {
    src: assets.icon4,
    alt: "Icon 4",
  },
  {
    src: assets.icon5,
    alt: "Icon 5",
  },
  {
    src: assets.icon6,
    alt: "Icon 6",
  },
];

const DMealComp = () => {
  return (
    <div className="w-full flex  justify-center items-center gap-4 mb-10 border-6 border-[#393a3c]  p-4  shadow-lg">
      {iconImages.map((icon, index) => (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          key={index}
          className="w-30 h-30 flex items-center justify-center rounded-full gap-1.5 shadow-2xl"
        >
          <img
            key={index}
            src={icon.src}
            alt={icon.alt}
            className=" w-full h-full object-cover"
          />
        </motion.div>
      ))}
      <h3 className="text-black">Dummy Meal Component</h3>
    </div>
  );
};

export default DMealComp;
