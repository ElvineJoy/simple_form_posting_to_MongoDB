const mongoose = require ('mongoose')

const studentTripSchema = new mongoose.Schema({
    studentName: String,
    grade: String,
    parentContact: String,
    tripDate: Date,
    amountPaid: Number,
    datePaid: Date,
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref:'User'}
});

module.exports = mongoose.model('StudentTrip', studentTripSchema);