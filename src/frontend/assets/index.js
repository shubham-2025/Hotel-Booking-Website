import logo from "../../assets/logo.svg";
import searchIcon from "../../assets/searchIcon.svg";
import userIcon from "../../assets/userIcon.svg";
import calenderIcon from "../../assets/calenderIcon.svg";
import locationIcon from "../../assets/locationIcon.svg";
import starIconFilled from "../../assets/starIconFilled.svg";
import arrowIcon from "../../assets/arrowIcon.svg";
import starIconOutlined from "../../assets/starIconOutlined.svg";
import instagramIcon from "../../assets/instagramIcon.svg";
import facebookIcon from "../../assets/facebookIcon.svg";
import twitterIcon from "../../assets/twitterIcon.svg";
import linkendinIcon from "../../assets/linkendinIcon.svg";
import freeWifiIcon from "../../assets/freeWifiIcon.svg";
import freeBreakfastIcon from "../../assets/freeBreakfastIcon.svg";
import roomServiceIcon from "../../assets/roomServiceIcon.svg";
import mountainIcon from "../../assets/mountainIcon.svg";
import poolIcon from "../../assets/poolIcon.svg";
import homeIcon from "../../assets/homeIcon.svg";
import closeIcon from "../../assets/closeIcon.svg";
import locationFilledIcon from "../../assets/locationFilledIcon.svg";
import heartIcon from "../../assets/heartIcon.svg";
import badgeIcon from "../../assets/badgeIcon.svg";
import menuIcon from "../../assets/menuIcon.svg";
import closeMenu from "../../assets/closeMenu.svg";
import guestsIcon from "../../assets/guestsIcon.svg";
import roomImg1 from "../../assets/roomImg1.png";
import roomImg2 from "../../assets/roomImg2.png";
import roomImg3 from "../../assets/roomImg3.png";
import roomImg4 from "../../assets/roomImg4.png";
import regImage from "../../assets/regImage.png";
import heroImageAsset from "../../assets/heroImage.png";
import exclusiveOfferCardImg1 from "../../assets/exclusiveOfferCardImg1.png";
import exclusiveOfferCardImg2 from "../../assets/exclusiveOfferCardImg2.png";
import exclusiveOfferCardImg3 from "../../assets/exclusiveOfferCardImg3.png";
import addIcon from "../../assets/addIcon.svg";
import dashboardIcon from "../../assets/dashboardIcon.svg";
import listIcon from "../../assets/listIcon.svg";
import uploadArea from "../../assets/uploadArea.svg";
import totalBookingIcon from "../../assets/totalBookingIcon.svg";
import totalRevenueIcon from "../../assets/totalRevenueIcon.svg";
import { assetToUrl } from "../lib/asset";

export const siteAssets = {
  logo: assetToUrl(logo),
  searchIcon: assetToUrl(searchIcon),
  userIcon: assetToUrl(userIcon),
  calenderIcon: assetToUrl(calenderIcon),
  locationIcon: assetToUrl(locationIcon),
  starIconFilled: assetToUrl(starIconFilled),
  arrowIcon: assetToUrl(arrowIcon),
  starIconOutlined: assetToUrl(starIconOutlined),
  instagramIcon: assetToUrl(instagramIcon),
  facebookIcon: assetToUrl(facebookIcon),
  twitterIcon: assetToUrl(twitterIcon),
  linkendinIcon: assetToUrl(linkendinIcon),
  freeWifiIcon: assetToUrl(freeWifiIcon),
  freeBreakfastIcon: assetToUrl(freeBreakfastIcon),
  roomServiceIcon: assetToUrl(roomServiceIcon),
  mountainIcon: assetToUrl(mountainIcon),
  poolIcon: assetToUrl(poolIcon),
  homeIcon: assetToUrl(homeIcon),
  closeIcon: assetToUrl(closeIcon),
  locationFilledIcon: assetToUrl(locationFilledIcon),
  heartIcon: assetToUrl(heartIcon),
  badgeIcon: assetToUrl(badgeIcon),
  menuIcon: assetToUrl(menuIcon),
  closeMenu: assetToUrl(closeMenu),
  guestsIcon: assetToUrl(guestsIcon),
  regImage: assetToUrl(regImage),
  addIcon: assetToUrl(addIcon),
  dashboardIcon: assetToUrl(dashboardIcon),
  listIcon: assetToUrl(listIcon),
  uploadArea: assetToUrl(uploadArea),
  totalBookingIcon: assetToUrl(totalBookingIcon),
  totalRevenueIcon: assetToUrl(totalRevenueIcon),
};

export const heroImage = assetToUrl(heroImageAsset);

export const offerImages = {
  exclusiveOfferCardImg1: assetToUrl(exclusiveOfferCardImg1),
  exclusiveOfferCardImg2: assetToUrl(exclusiveOfferCardImg2),
  exclusiveOfferCardImg3: assetToUrl(exclusiveOfferCardImg3),
};

export const roomImageGallery = {
  roomImg1: assetToUrl(roomImg1),
  roomImg2: assetToUrl(roomImg2),
  roomImg3: assetToUrl(roomImg3),
  roomImg4: assetToUrl(roomImg4),
};

export const facilityIcons = {
  "Free WiFi": siteAssets.freeWifiIcon,
  "Free Breakfast": siteAssets.freeBreakfastIcon,
  "Room Service": siteAssets.roomServiceIcon,
  "Mountain View": siteAssets.mountainIcon,
  "Pool Access": siteAssets.poolIcon,
};
