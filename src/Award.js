const consts = require('./consts')
const utils = require('./utils')

class Award {
  constructor (attributes, flight = null) {
    // Read attributes and apply defaults
    const {
      engine,
      partner = flight ? !flight.airlineMatches(engine) : false,
      cabins,
      fare,
      quantity,
      exact = false,
      waitlisted = false,
      mileageCost = null,
      fees = null
    } = attributes

    // Populate cabins from flight, if not defined
    let arrCabins
    if (cabins) {
      arrCabins = [...cabins]
    } else if (flight === null) {
      throw new Error(`Invalid award cabins: ${cabins} (cabins must be defined when no flight is given)`)
    } else {
      arrCabins = flight.segments.map(x => x.cabin)
    }

    // Validate attributes
    if (!utils.validAirlineCode(engine)) {
      throw new Error(`Invalid award engine: ${engine}`)
    }
    if (!Array.isArray(arrCabins) || arrCabins.length === 0) {
      throw new Error(`Invalid award cabins: ${arrCabins}`)
    }
    for (const cabin of arrCabins) {
      if (!(cabin in consts.cabins)) {
        throw new Error(`Invalid award cabin "${cabin}" found in cabins: ${arrCabins}`)
      }
    }
    if (flight && arrCabins.length !== flight.segments.length) {
      throw new Error(`Invalid award cabin: ${flight.segments.length} segments defined, but only ${arrCabins.length} cabins`)
    }
    if (!fare || fare.constructor.name !== 'BookingClass') {
      throw new Error(`Invalid award fare: ${fare}`)
    }
    if (!quantity || !utils.positiveInteger(quantity)) {
      throw new Error(`Invalid award quantity: ${quantity}`)
    }
    if (mileageCost && !utils.positiveInteger(mileageCost)) {
      throw new Error(`Invalid award mileageCost: ${mileageCost}`)
    }
    if (fees && !utils.validCurrency(fees)) {
      throw new Error(`Invalid award fees: ${fees}`)
    }

    // Calculate whether we have mixed cabins
    const mixedCabin = !arrCabins.every((val, i, arr) => val === arr[0])

    // Set internal state
    this._state = {
      engine,
      partner,
      cabins: Object.freeze(arrCabins),
      mixedCabin,
      fare,
      quantity,
      exact,
      waitlisted,
      mileageCost,
      fees
    }

    // Properly assign the flight this award
    flight._assignAward(this)
  }

  toJSON (includeFlight = true) {
    const ret = { ...this._state }
    ret.flight = (ret.flight && includeFlight) ? ret.flight.toJSON(false) : null
    ret.cabins = [...ret.cabins]
    ret.fare = ret.fare.toJSON()
    return ret
  }

  toString () {
    return utils.ppJSON(this.toJSON())
  }

  get flight () {
    return this._state.flight
  }

  get engine () {
    return this._state.engine
  }

  get partner () {
    return this._state.partner
  }

  get cabins () {
    return this._state.cabins
  }

  get mixedCabin () {
    return this._state.mixedCabin
  }

  get fare () {
    return this._state.fare
  }

  get quantity () {
    return this._state.quantity
  }

  get exact () {
    return this._state.exact
  }

  get waitlisted () {
    return this._state.waitlisted
  }

  get mileageCost () {
    return this._state.mileageCost
  }

  get fees () {
    return this._state.fees
  }
}

module.exports = Award
