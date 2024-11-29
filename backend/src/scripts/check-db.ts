import mongoose from 'mongoose';
import Club from '../models/Club';
import Swimmer from '../models/Swimmer';

async function checkDatabase() {
    try {
        await mongoose.connect('mongodb://localhost:27017/swim-analytics');
        console.log('Connected to MongoDB');

        // Count documents
        const clubCount = await Club.countDocuments();
        const swimmerCount = await Swimmer.countDocuments();
        
        console.log(`\nDatabase Statistics:`);
        console.log(`Total Clubs: ${clubCount}`);
        console.log(`Total Swimmers: ${swimmerCount}`);

        // Sample clubs
        console.log('\nSample Clubs:');
        const clubs = await Club.find().limit(3);
        clubs.forEach(club => {
            console.log(`\nClub: ${club.name}`);
            console.log(`City: ${club.city}`);
            console.log(`Coach: ${club.coach}`);
            console.log(`Number of swimmers: ${club.swimmers?.length || 0}`);
        });

        // Sample swimmers
        console.log('\nSample Swimmers:');
        const swimmers = await Swimmer.find().limit(3).populate('club');
        swimmers.forEach(swimmer => {
            console.log(`\nSwimmer ID: ${swimmer.lpinId}`);
            console.log(`Club: ${(swimmer.club as any)?.name || 'Unknown'}`);
            console.log(`Birth Year: ${swimmer.birthYear}`);
            console.log(`LPIN License: ${swimmer.lpinLicenseNumber}`);
            if (swimmer.personalBests && swimmer.personalBests.length > 0) {
                console.log('\nTop Personal Bests:');
                swimmer.personalBests.slice(0, 3).forEach(pb => {
                    console.log(`- ${pb.style}: ${pb.time} (${pb.competition})`);
                });
            }
            if (swimmer.participations && swimmer.participations.length > 0) {
                console.log('\nRecent Participations:');
                swimmer.participations.slice(0, 3).forEach(p => {
                    console.log(`- ${p.competitionName} (${p.date.start.toLocaleDateString()})`);
                    p.results.slice(0, 2).forEach(r => {
                        console.log(`  * ${r.style}: ${r.time} - Place: ${r.place}`);
                    });
                });
            }
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkDatabase();
