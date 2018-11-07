import xmlToJson from '../lib/xmlToJson'
const app = getApp()


// pages/index.js
var latitude;
var longitude;
var forecast48hTime = []
var forecast48hSkycon = []
var forecast48htemperature = []
var forecast5dTime = []
var forecast5dSkycon = []
var forecast5dtemperatureMAX = []
var forecast5dtemperatureMIN = []
var iconENUM = {
  'CLEAR_DAY': '../assets/svg/001-sun.svg',
  'CLEAR_NIGHT': '../assets/svg/moon.svg',
  'PARTLY_CLOUDY_DAY': '../assets/svg/034-cloudy.svg',
  'PARTLY_CLOUDY_NIGHT': '../assets/svg/014-cloudy-night.svg',
  'CLOUDY': '../assets/svg/012-cloud.svg',
  'RAIN': '../assets/svg/038-rain-3.svg',
  'SNOW': '../assets/svg/035-snow.svg',
  'WIND': '../assets/svg/018-wind.svg',
  'HAZE': '../assets/svg/fog.svg'
}

function formatPM25(pm25) {
  var pm25Enum = ['重度污染', '中度污染', '轻度污染', '良', '优']
  var level;
  if (300 <= pm25) {
    level = pm25Enum[0]
  } else if (200 <= pm25) {
    level = pm25Enum[1]
  } else if (100 <= pm25) {
    level = pm25Enum[2]
  } else if (50 <= pm25) {
    level = pm25Enum[3]
  } else {
    level = pm25Enum[4]
  }
  return level
}

var pm25ENUM = {
  '重度污染': '../assets/svg/devil.svg',
  '中度污染': '../assets/svg/surprised.svg',
  '轻度污染': '../assets/svg/sad.svg',
  '良': '../assets/svg/happy.svg',
  '优': '../assets/svg/best.svg'
}

var colorENUM = {
  'CLEAR_DAY': ['#ff5959', '#ffad5a', '#4f9da6'],
  'CLEAR_NIGHT': ['#182952', '#2b3595', '#7045af'],
  'PARTLY_CLOUDY_DAY': ['#2d3999', '#63aebb', '#8ea6b4'],
  'PARTLY_CLOUDY_NIGHT': ['#2d3999', '#63aebb', '#8ea6b4'],
  'CLOUDY': ['#2d3999', '#63aebb', '#8ea6b4'],
  'RAIN': ['#005792', '#53cde2', '#4f9da6'],
  'SNOW': ['#005792', '#53cde2', '#4f9da6'],
  'WIND': ['#a3a7e4', '#929aab', '#474a56'],
  'HAZE': ['#cb9b42', '#b1d1c5', '#a6aa9c']
}

var descENUM = {
  'CLEAR_DAY': '晴',
  'CLEAR_NIGHT': '晴',
  'PARTLY_CLOUDY_DAY': '多云',
  'PARTLY_CLOUDY_NIGHT': '多云',
  'CLOUDY': '多云',
  'RAIN': '雨',
  'SNOW': '雪',
  'WIND': '风',
  'HAZE': '雾'
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAuthorityOk: true,
    isLoading: true,
    backgroundColors: [],
    temperature: 0,
    skycon: "",
    pm25: {},
    icon: '',
    tips: '',
    forecast48h: [],
    forecast5d: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('index')
    console.log(app.globalData)
    if (app.globalData.search) {

      latitude = app.globalData.search.latitude
      longitude = app.globalData.search.longitude

      Promise.all([this._getCurrentCity(), this._getCurrentWeather(), this._getWeatherForecast(),this._getTips()]).then(() => {
        this.setData({
          isLoading: false
        })
      })

    } else {
      wx.getLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        success: (res) => {
          latitude = res.latitude
          longitude = res.longitude

          app.globalData.currentLocation = { latitude: latitude, longitude: longitude }
          console.log(latitude, longitude)

          Promise.all([this._getCurrentCity(), this._getCurrentWeather(), this._getWeatherForecast(),this._getTips()]).then(() => {
            this.setData({
              isLoading: false
            })
          })

        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  _getCurrentCity() {
    return new Promise((resolve, reject) => {
      // 请求当前的位置
      wx.request({
        url: 'https://api.map.baidu.com/geocoder/v2/',
        data: {
          ak: 'E49CPsbVde821vf7MFXdk8iv3HfXkYLv',
          location: latitude + ',' + longitude,
          output: 'json'
        },
        success: (res) => {
          console.log(res)
          var l = res.data.result.addressComponent.country + res.data.result.addressComponent.city + ' ' + res.data.result.addressComponent.district
          wx.setNavigationBarTitle({
            title: l
          })
          resolve()
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  _getCurrentWeather() {
    return new Promise((resolve, reject) => {
      //当前天气情况
      wx.request({
        url: `https://api.caiyunapp.com/v2/L782HERzblwLP4Fe/${longitude},${latitude}/realtime.json`,
        data: {},
        success: (res) => {
          console.log("current", res)
          var result = res.data.result
          var pm25Level = formatPM25(result.pm25) || 0
          var pm25Icon = pm25ENUM[pm25Level]
          this.setData({
            temperature: Math.round(result.temperature) || 0,
            skycon: descENUM[result.skycon] || '',
            pm25: { desc: pm25Level, icon: pm25Icon },
            backgroundColors: colorENUM[result.skycon] || [],
            icon: iconENUM[result.skycon] || ''
          })

          wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: this.data.backgroundColors[0],
            animation: {
              duration: 400,
              timingFunc: 'easeIn'
            }
          })

          resolve()
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },
  _getWeatherForecast() {
    return new Promise((resolve, reject) => {

      //天气预报
      wx.request({
        url: `https://api.caiyunapp.com/v2/L782HERzblwLP4Fe/${longitude},${latitude}/forecast.json`,
        data: {},
        success: (res) => {
          var result = res.data.result
          console.log('48h', res)

          forecast48hTime = result.hourly.skycon.map((hour) => /\b(\d\d:\d\d)$/.exec(hour.datetime)[0]) || []
          forecast48hSkycon = result.hourly.skycon.map((hour) => hour.value) || []
          forecast48htemperature = result.hourly.temperature.map((hour) => Math.round(hour.value)) || []
          forecast5dTime = result.daily.skycon.map((day) => day.date) || []
          forecast5dSkycon = result.daily.skycon.map((day) => day.value) || []
          forecast5dtemperatureMAX = result.daily.temperature.map((day) => Math.round(day.max)) || []
          forecast5dtemperatureMIN = result.daily.temperature.map((day) => Math.round(day.min)) || []

          var forecast48h = []
          var forecast5d = []
          forecast48hTime.forEach((hour, index, array) => {
            forecast48h.push({ time: hour, icon: iconENUM[forecast48hSkycon[index]], temperature: forecast48htemperature[index], desc: descENUM[forecast48hSkycon[index]] })
          })

          forecast5dTime.forEach((day, index, array) => {
            forecast5d.push({ time: day, icon: iconENUM[forecast5dSkycon[index]], temperatureMAX: forecast5dtemperatureMAX[index], temperatureMIN: forecast5dtemperatureMIN[index], desc: descENUM[forecast48hSkycon[index]] })
          })

          forecast5d.unshift({ time: 'date', icon: '', temperatureMAX: 'MAX', temperatureMIN: 'MIN' })

          this.setData({
            forecast48h: forecast48h,
            forecast5d: forecast5d
          })
        },
        fail: (err) => {
          throw err
        }
      })
    })
  },
  onChooseButtonTap() {
    wx.chooseLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success(res) {
        console.log(res)
        var latitude = res.latitude
        var longitude = res.longitude

        app.globalData.search = { latitude: latitude, longitude: longitude }

        wx.redirectTo({
          url: 'index',
          success: (res) => {
            console.log(res)
          },
          fail: (err) => {
            console.log(11)
            throw err
          }
        })
      },
      fail: (err) => {
        wx.redirectTo({
          url: 'index',
          success: (res) => {
            console.log(res)
          },
          fail: (err) => {
            console.log(11)
            throw err
          }
        })
        throw err

      }
    })
  },
  onReloadButtonTap() {
    app.globalData.search = app.globalData.currentLocation
    wx.redirectTo({
      url: 'index',
      success: (res) => {
        console.log(res)
      },
      fail: (err) => {
        console.log(11)
        throw err
      }
    })
  },
  _getTips() {
    return new Promise((reaolve, reject) => {
      wx.request({
        url: 'http://v.juhe.cn/weather/index',
        data: {
          lat: latitude,
          lon: longitude,
          APPID: 'b0264da3334b626bb176cd1754e4c3b0',
          dtype: 'xml'
        },
        success: (res) => {
          console.log("111", res)
          json = xmlToJSON.parseString(res);
          var tips = json.result.tips
          this.setData({
            tips: tips
          })
          resolve()
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }
})