const Discord = require ( "discord.js" );
const client = new Discord.Client ();
const logs = require ( "discord-logs" );
const db = require ( "quick.db" );
const ayarlar = require("./ayarlar.json");
var moment = require ( "moment" );
const fs = require('fs');
require ( "moment-duration-format" );
logs ( client );
let pub = "837062891042897962";
let kayıt = "837062882805940255"
let alone = "801495991458070578"
let yönetim = "762761450255024128"
let game = "837062893505216562"
let secret = "762761455379546183"

client.on ( "ready" , () => {
    console.log ( client.user.username + " ismiyle giriş yapıldı." );
} );
////////////////////////////////////////////////////////////////
client.on("message", async message => {
  let args = message.content.split(' ').slice(1);
  let command = message.content.split(' ')[0].slice(ayarlar.prefix.length);
  let embed = new Discord.MessageEmbed().setColor("BLACK")//.setFooter(`Archilles was here!`).setTimestamp();

  //// Kullanıcı güvenli ekleme kısmı
  if (command === "tknlist" || command === "tknekle" || command === "engel" || command === "engelle" || command === "tkn" || command === "token" || command === "tokenekle") {
    if(!message.member.hasPermission('ADMINISTRATOR')) return;
    let hedef;
    let rol = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) || message.guild.roles.cache.find(r => r.name === args.join(" "));
    let uye = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
    if (rol) hedef = rol;
    if (uye) hedef = uye;
    let guvenliler = ayarlar.tokenler || [];
    if (!hedef) return message.channel.send(embed.setDescription(`Stats veri engelleme listesine ekleme veya kaldırma yapmak için bir rol veya üye ID'si belirtmelisiniz.`).addField("Verileri Kaydedilmeyenler Listesi", guvenliler.length > 0 ? guvenliler.map(g => (message.guild.roles.cache.has(g.slice(1)) || message.guild.members.cache.has(g.slice(1))) ? (message.guild.roles.cache.get(g.slice(1)) || message.guild.members.cache.get(g.slice(1))) : g).join('\n')+" " : "bulunamadı"));
    if (guvenliler.some(g => g.includes(hedef.id))) {
      guvenliler = guvenliler.filter(g => !g.includes(hedef.id));
      ayarlar.tokenler = guvenliler;
      fs.writeFile("./ayarlar.json", JSON.stringify(ayarlar), (err) => {
        if (err) console.log(err);
      });
      message.channel.send(embed.setDescription(`${hedef}, veri engelleme listesinden kaldırıldı!`));
    } else {
      ayarlar.tokenler.push(`${hedef.id}`);
      fs.writeFile("./ayarlar.json", JSON.stringify(ayarlar), (err) => {
        if (err) console.log(err);
      });
      message.channel.send(embed.setDescription(`${hedef}, veri engelleme listesine eklendi!`));
    };
  };
});
function guvenli(kisiID) {
  let uye = client.guilds.cache.get(ayarlar.sunucuid).members.cache.get(kisiID);
  let guvenliler = ayarlar.tokenler || [];
  if (!uye || uye.id === client.user.id || uye.id === ayarlar.sahip || guvenliler.some(g => uye.id === g.slice(1) || uye.roles.cache.has(g.slice(1)))) return true
  else return false;
};
////////////////////////////////////////////////////////////////
client.on ( "voiceChannelJoin" , ( member , channel ) => {
  if(ayarlar.tokenler.some(x => member.id === x)) return;
    if ( member.user.bot ) return
    //if (!member.roles.cache.has("rolID")) return
    const json = {
        "channel" : channel.id ,
        "start" : new Date ().getTime ()
    };
    db.set ( `1data:${ member.user.id }:${ channel.id }` , json );
} );

client.on ( "voiceChannelLeave" , ( member , channel ) => {
  if(ayarlar.tokenler.some(x => member.id === x)) return;
    if ( member.user.bot ) return;
    //if (!member.roles.cache.has ("rolID")) return
    let data = db.fetch ( `1data:${ member.user.id }:${ channel.id }` );
    if ( data ) {
        let total = db.fetch ( `1total:${ member.user.id }:${ channel.id }` ) || {
            "total" : 0
        };

        const json = {
            "channel" : data.channel ,
            "total" : Number ( total.total ) + (
                new Date ().getTime () - Number ( data.start )
            )
        };
        db.set ( `1total:${ member.user.id }:${ channel.id }` , json );
        db.delete ( `1data:${ member.user.id }:${ channel.id }` );
        db.add ( `2channel:${ channel.id }` , new Date ().getTime () - Number ( data.start ) )
        if ( channel.parentID === pub ) {
            db.add (
                `1public:${ member.user.id }` ,
                new Date ().getTime () - Number ( data.start )
            );
        }
        else if ( channel.parentID == secret ) {
            db.add ( `1private:${ member.user.id }` , new Date ().getTime () - Number ( data.start ) )
        }
        else if ( channel.parentID == kayıt ) {
            db.add ( `1kayıt:${ member.user.id }` , new Date ().getTime () - Number ( data.start ) )
        }
        else if ( channel.parentID == alone ) {
            db.add ( `1yayıncı:${ member.user.id }` , new Date ().getTime () - Number ( data.start ) )
        }
        else if ( channel.parentID == yönetim ) {
            db.add ( `1mod:${ member.user.id }` , new Date ().getTime () - Number ( data.start ) )
        }
    }
} );

client.on ( "voiceChannelSwitch" , ( member , oldChannel , newChannel ) => {
  if(ayarlar.tokenler.some(x => member.id === x)) return;
    if ( member.user.bot ) return;
    let data = db.fetch ( `1data:${ member.user.id }:${ oldChannel.id }` );
    if ( data ) {
        let mainData = db.fetch ( `1total:${ member.user.id }:${ data.channel }` ) || {
            "total" : 0
        };
        const json = {
            "channel" : data.channel ,
            "total" :
                Number ( mainData.total ) + (
                new Date ().getTime () - Number ( data.start )
                                          )
        };
        db.set ( `1total:${ member.user.id }:${ oldChannel.id }` , json );
        db.add ( `2channel:${ oldChannel.id }` , new Date ().getTime () - Number ( data.start ) )
        const json2 = {
            "channel" : newChannel.id ,
            "start" : new Date ().getTime ()
        };
        db.set ( `1data:${ member.user.id }:${ newChannel.id }` , json2 );
        if ( oldChannel.parentID === pub ) {
            db.add (
                `1public:${ member.user.id }` ,
                new Date ().getTime () - Number ( data.start )
            );
        }
        else if ( oldChannel.parentID == secret ) {
            db.add ( `1private:${ member.user.id }` , new Date ().getTime () - Number ( data.start ) )
        }
        else if ( oldChannel.parentID == kayıt ) {
            db.add ( `1kayıt:${ member.user.id }` , new Date ().getTime () - Number ( data.start ) )
        }
        else if ( oldChannel.parentID == alone ) {
            db.add ( `1yayıncı:${ member.user.id }` , new Date ().getTime () - Number ( data.start ) )
        }
        else if ( oldChannel.parentID == yönetim ) {
            db.add ( `1mod:${ member.user.id }` , new Date ().getTime () - Number ( data.start ) )
        }
    }
} );

client.on ( "message" , async message => {
  if(ayarlar.tokenler.some(x => message.author.id === x)) return;
    if ( message.author.bot ) return;
    let member = message.guild.members.cache.get ( message.author.id )
 //if(!['792082700508856360'].some(role => message.member.roles.cache.get(role)) && !message.member.hasPermission('ADMINISTRATOR')) return message.react('❌')
    var totall = (
                     await db.fetch (
                         `messageCount:${ message.author.id }:${ message.channel.id }`
                     )
                 ) || { "count" : 0 };
    db.set ( `messageCount:${ message.author.id }:${ message.channel.id }` , {
        "channel" : message.channel.id ,
        "count" : totall.count + 1
    } );
    db.add ( `totalMessage:${ message.author.id }` , 1 );
    db.add ( `3mesajKanal:${ message.channel.id }` , 1 )
    var st = message.member.voice;
    var data = await db.fetch ( `1data:${ message.author.id }:${ st.channelID }` );
    if ( data ) {
        var total = (
                        await db.fetch (
                            `1total:${ message.author.id }:${ data.channel }`
                        )
                    ) || { "total" : 0 };
        const json = {
            "channel" : data.channel ,
            "total" : Number ( total.total ) + (
                Date.now () - Number ( data.start )
            )
        };
        db.set ( `1total:${ message.author.id }:${ data.channel }` , json );
        db.delete ( `1data:${ message.author.id }:${ st.channelID }` );
        const json2 = {
            "channel" : st.channelID ,
            "start" : Date.now ()
        };
        db.set ( `1data:${ message.author.id }:${ st.channelID }` , json2 );
        db.add ( `2channel:${ st.channelID }` , new Date ().getTime () - Number ( data.start ) )
        if ( st.channel.parentID === pub ) {
            db.add (
                `1public:${ message.author.id }` ,
                new Date ().getTime () - Number ( data.start )
            );
        }
        else if ( st.channel.parentID == secret ) {
            db.add ( `1private:${ message.author.id }` , new Date ().getTime () - Number ( data.start ) )
        }
        else if ( st.channel.parentID == kayıt ) {
            db.add ( `1kayıt:${ message.author.id }` , new Date ().getTime () - Number ( data.start ) )
        }
        else if ( st.channel.parentID == alone ) {
            db.add ( `1yayıncı:${ message.author.id }` , new Date ().getTime () - Number ( data.start ) )
        }
        else if ( st.channel.parentID == yönetim ) {
            db.add ( `1mod:${ message.author.id }` , new Date ().getTime () - Number ( data.start ) )
        }
    }
} );

client.on("message", async (msg) => {
  let args = msg.content.split(' ').slice(1);
  let command = msg.content.split(' ')[0].slice(ayarlar.prefix.length);

      let taglar = ['r?u',"r?me","r?stats","r?stat"]
    //if(taglar.some(r=>msg.content.toLowerCase() ===r )){
        if(msg.content.startsWith("r?u") || msg.content.startsWith("r?me")) {
  //if (command === "u" || command === "me" || command === "stats" || command === "stat") {

    //if ( msg.content.startsWith("r?me") || msg.content.startsWith("r?u") || msg.content.startsWith("r?stat") || msg.content.startsWith ("r?stats")) {
        if (msg.author.bot) return;
        var user = msg.mentions.users.first()
        user = user ? user : msg.author;
        let member = msg.guild.members.cache.get(user.id)
  //if(!['782582058199416842'].some(role => msg.member.roles.cache.get(role)) && !msg.member.hasPermission('ADMINISTRATOR')) return msg.react('❌')
        let st = member.voice
        var data1 = await db.fetch ( `1data1:${ user.id }:${ st.channelID }` );
        if ( data1 ) {
            var total = (
                            await db.fetch (
                                `1total:${ user.id }:${ data1.channel }`
                            )
                        ) || { "total" : 0 };
            const json = {
                "channel" : data1.channel ,
                "total" : Number ( total.total ) + (
                    Date.now () - Number ( data1.start )
                )
            };
            db.set ( `1total:${ user.id }:${ data1.channel }` , json );
            db.delete ( `1data:${ user.id }:${ st.channelID }` );
            const json2 = {
                "channel" : st.channelID ,
                "start" : Date.now ()
            };
            db.set ( `1data:${ user.id }:${ st.channelID }` , json2 );
            if ( st.channel.parentID === pub ) {
                db.add (
                    `1public:${ user.id }` ,
                    new Date ().getTime () - Number ( data1.start )
                );
            }
            else if ( st.channel.parentID == secret ) {
                db.add ( `1private:${ member.user.id }` , new Date ().getTime () - Number ( data.start ) )
            }
            else if ( st.channel.parentID == kayıt ) {
                db.add ( `1kayıt:${ member.user.id }` , new Date ().getTime () - Number ( data.start ) )
            }
            else if ( st.channel.parentID == alone ) {
                db.add ( `1yayıncı:${ member.user.id }` , new Date ().getTime () - Number ( data.start ) )
            }
            else if ( st.channel.parentID == yönetim ) {
                db.add ( `1mod:${ member.user.id }` , new Date ().getTime () - Number ( data.start ) )
            }
        }
        let data = await db
            .all ()
            .filter ( x => x.ID.startsWith ( `1total:${ user.id }` ) )
            .sort ( function ( a , b ) {
                return JSON.parse ( b.data ).total - JSON.parse ( a.data ).total;
            } );
        let ses = await db.fetch ( `1public:${ user.id }` ) || 0
        let priv1 = await db.fetch ( `1private:${ user.id }` ) || 0
        let kayıt1 = await db.fetch ( `1kayıt:${ user.id }` ) || 0
        let yayin1 = await db.fetch ( `1yayıncı:${ user.id }` ) || 0
        let mod1 = await db.fetch ( `1mod:${ user.id }` ) || 0
        let format = moment.duration ( ses ).format ( "h [saat,] m [dakika]" );
        let toplamPriv = moment.duration ( priv1 ).format ( "h [saat,] m [dakika]" );
        let toplamKayıt = moment.duration ( kayıt1 ).format ( "h [saat,] m [dakika]" );
        let toplamYayıncı = moment.duration ( yayin1 ).format ( "h [saat,] m [dakika]" );
        let toplamMod = moment.duration ( mod1 ).format ( "h [saat,] m [dakika]" );
        let sayi = data.length;
      
        var isimler = [];
        data.length = 5;//10
        var i = 0;//0
      let ss2 = 1
        let arr = [];
        for(i in data) {
            arr.push(Number(JSON.parse(data[i].data).total));
            isimler.push(`\`${ss2++}.\` <#${JSON.parse(data[i].data).channel}>: \`${moment.duration(Number(JSON.parse(data[i].data).total))
                         .format("h [saat,] m [dakika]")}\``);
        }
        var textDatas = db
            .all ()
            .filter ( x => x.ID.startsWith ( `messageCount:${ user.id }` ) )
            .sort ( function ( a , b ) {
                return JSON.parse ( b.data ).count - JSON.parse ( a.data ).count;
            } );
        var textTotal = (
                            await db.fetch ( `totalMessage:${ user.id }` )
                        ) || 0;
        textDatas.length = 5; //5
        var liste = "";
      let ss3 = 1
        var i = 0;
        for (i in textDatas ) {
            liste += `\`${ss3++}.\` <#${JSON.parse(textDatas[i].data).channel}>: \`${JSON.parse(textDatas[i].data).count}\` \n`;
        }

        let data2 = await db
            .all ()
            .filter ( x => x.ID.startsWith ( `1total:${ user.id }` ) )
            .sort ( function ( a , b ) {
                return JSON.parse ( b.data ).total - JSON.parse ( a.data ).total;
            } );
        let uw = 0
        let array = []
        for ( uw in data2 ) {
            array.push ( Number ( JSON.parse ( data2[ uw ].data ).total ) );
        }
        let toplam = moment
            .duration(array.reduce((a, b) => a + b, 0))
            .format("h [saat,] m [dakika,]"); //s [saniye]
        let üye = msg.guild.members.cache.get(user.id)
        
try {
  if(!db.fetch(`totalMessage:${user.id}`)) return msg.channel.send(new Discord.MessageEmbed().setColor("RANDOM").setAuthor(user.tag || msg.author.tag, user.displayAvatarURL() || msg.author.displayAvatarURL()).setThumbnail(üye.user.displayAvatarURL() || msg.author.user.displayAvatarURL()).setDescription(`${üye} (${üye.roles.highest}) üyesinin sunucu istatistikleri;`).addField(`• Sesli Sohbet İstatistiği`,`\`>\` Toplam: \`${toplam}\`\n\`>\` Kayıt Odaları: \`${toplamKayıt}\`\n\`>\` Sorun Çözme: \`${toplamMod}\`\n\`>\` Streamer Room: \`${toplamYayıncı}\`\n\`>\` Public Odalar: \`${format}\`\n\`>\` Özel Sohbetler: \`${toplamPriv}\``,false).addField(`• Kanal Bilgileri (${sayi} kanalda bulunmuş)`,`${isimler.join("\n")}`,false).addField(`• Mesaj İstatistiği`,`\`>\` Toplam \`0\``,false)      .addField(`• Mesaj Sıralaması (Toplam: 0)`,`Kayıtlı hiçbir mesaj verisi olmadığı için sıralanamadı.`,true))
} catch (error) {
return msg.channel.send(new Discord.MessageEmbed().setColor("RANDOM").setAuthor(user.tag || msg.author.tag, user.displayAvatarURL() || msg.author.displayAvatarURL()).setThumbnail(üye.user.displayAvatarURL() || msg.author.user.displayAvatarURL()).setDescription(`${üye} (${üye.roles.highest}) üyesinin sunucu istatistikleri;`).addField(`• Sesli Sohbet İstatistiği`,`\`>\` Toplam: \`0\`\n\`>\` Kayıt Odaları: \`0\`\n\`>\` Sorun Çözme: \`0\`\n\`>\` Streamer Room: \`0\`\n\`>\` Public Odalar: \`0\`\n\`>\` Özel Sohbetler: \`0\``,false).addField(`• Kanal Bilgileri (0 kanalda bulunmuş)`,`Kayıtlı hiçbir ses verisi olmadığı için sıralanamadı.󠇰󠇰󠇰󠇰󠇰󠇰󠇰󠇰󠇰󠇰󠇰󠇰`,false).addField(`• Mesaj İstatistiği`,`\`>\` Toplam \`0\``,false).addField(`• Mesaj Sıralaması (Toplam: 0)`,`Kayıtlı hiçbir ses verisi olmadığı için sıralanamadı.󠇰󠇰󠇰󠇰󠇰󠇰󠇰󠇰󠇰󠇰󠇰󠇰`,true))
}

  try {
const embed = new Discord.MessageEmbed()
.setAuthor(user.tag || msg.author.tag, user.displayAvatarURL() || msg.author.displayAvatarURL())
.setColor("RANDOM")
.setThumbnail(üye.user.displayAvatarURL() || msg.author.user.displayAvatarURL())
.setDescription(`${üye} (${üye.roles.highest}) üyesinin sunucu istatistikleri;`) //• Toplam: \`${ toplam }\`• Public Odalar: \`${ format }\`• Kayıt Odaları: \`${ toplamKayıt }\`• Sorun Çözme & Terapi: \`${ toplamMod }\`• Private Odalar: \`${ toplamPriv }\`• Alone Odalar: \`${ toplamAlone }\`• Oyun & Eğlence Odaları: \`${ toplamGame }\`

.addField(`• Sesli Sohbet İstatistiği`,`\`>\` Toplam: \`${toplam}\`\n\`>\` Kayıt Odaları: \`${toplamKayıt}\`\n\`>\` Sorun Çözme: \`${toplamMod}\`\n\`>\` Streamer Room: \`${toplamYayıncı}\`\n\`>\` Public Odalar: \`${format}\`\n\`>\` Özel Sohbetler: \`${toplamPriv}\``,false)
.addField(`• Kanal Bilgileri (${sayi} kanalda bulunmuş)`,`${isimler.join("\n")}`,false) //${isimler.join("\n")}
.addField(`• Mesaj İstatistiği`,`\`>\` Toplam \`${textTotal}\``,false)      
.addField(`• Mesaj Sıralaması (Toplam: ${textTotal})`,`${liste}`,true)
  msg.channel.send(embed)
        } catch (error) {

msg.channel.send(new Discord.MessageEmbed()
.setColor("RANDOM")
  .setAuthor(user.tag || msg.author.tag, user.displayAvatarURL() || msg.author.displayAvatarURL())
 .setThumbnail(üye.user.displayAvatarURL() || msg.author.user.displayAvatarURL())
 .setDescription(`${üye} (${üye.roles.highest}) üyesinin sunucu istatistikleri;`) //• Toplam: \`${ toplam }\`• Public Odalar: \`${ format }\`• Kayıt Odaları: \`${ toplamKayıt }\`• Sorun Çözme & Terapi: \`${ toplamMod }\`• Private Odalar: \`${ toplamPriv }\`• Alone Odalar: \`${ toplamAlone }\`• Oyun & Eğlence Odaları: \`${ toplamGame }\`
.addField(`• Sesli Sohbet İstatistiği`,`\`>\` Toplam: \`0\`\n\`>\` Kayıt Odaları: \`0\`\n\`>\` Sorun Çözme: \`0\`\n\`>\` Streamer Room: \`0\`\n\`>\` Public Odalar: \`0\`\n\`>\` Özel Sohbetler: \`0\``,false)
.addField(`• Kanal Bilgileri (0 kanalda bulunmuş)`,`Kayıtlı hiçbir ses verisi olmadığı için sıralanamadı.󠇰󠇰󠇰󠇰󠇰󠇰󠇰󠇰󠇰󠇰󠇰󠇰`,false) //${isimler.join("\n")}
.addField(`• Mesaj İstatistiği`,`\`>\` Toplam \`${textTotal}\``,false)      
.addField(`• Mesaj Sıralaması (Toplam: ${textTotal})`,`${liste}`,true))
        }
            }
       // }
} );


client.on ( "message" , async msj => {
    let member = msj.guild.members.cache.get(msj.author.id)
//if(!['782582058199416842'].some(role => msj.member.roles.cache.get(role)) && !msj.member.hasPermission('ADMINISTRATOR')) return msj.react('❌')
    //if (!msj.content.startsWith(".top")) {
      //  return;
    //}
      if(msj.content.startsWith("r?top")) {
  if(!msj.member.hasPermission('ADMINISTRATOR')) return;

    let data = await db
        .all ()
        .filter ( x => x.ID.startsWith ( `1total` ) )
        .sort ( function ( a , b ) {
            return JSON.parse ( b.data ).total - JSON.parse ( a.data ).total;
        } );
    var liste = []
    var i = 0;
    for ( i in data ) {
        liste.push ( {
                         "kullanıcı" : data[ i ].ID.split ( ":" )[ 1 ] ,
                         "sure" : JSON.parse ( data[ i ].data ).total
                     } )

    }
    var result = []
    liste.reduce ( function ( res , value ) {
        if ( ! res[ value.kullanıcı ] ) {
            res[ value.kullanıcı ] = { "kullanıcı" : value.kullanıcı , "sure" : 0 };
            result.push ( res[ value.kullanıcı ] )
        }
        res[ value.kullanıcı ].sure += value.sure;
        return res;
    } , {} );
    db.set ( `%tamam${ msj.guild.id }` , result )
    let sos = await db.fetch ( `%tamam${ msj.guild.id }` )
    let uu = sos.sort ( function ( a , b ) {
        return b.sure - a.sure
    } )
    let tiki = 0
    uu.length = 5
    let arrays = []
    let num = 1
    for ( tiki in uu ) {
        arrays.push ( `\`${ num++ }.\` <@${ uu[ tiki ].kullanıcı }>: \`${ moment.duration ( Number ( uu[ tiki ].sure ) ).format ( "h [saat,] m [dakika]" ) }\`` )
    }
    let mesaj = db.all ().filter ( x => x.ID.startsWith ( `totalMessage` ) ).sort ( function ( a , b ) {
        return b.data - a.data
    } )
    mesaj.length = 5
    let bak = 0
    let sayı = 1
    let aruuy = []
    for ( bak in mesaj ) {
        aruuy.push ( `\`${ sayı++ }.\` <@${ mesaj[ bak ].ID.split ( ":" )[ 1 ] }>: \`${ mesaj[ bak ].data }\`` )
    }
    let kanal = db.all ().filter ( x => x.ID.startsWith ( `2channel` ) ).sort ( function ( a , b ) {
        return b.data - a.data
    } )
    let cems = 0
    kanal.length = 5
    let nams = 1
    let arooy = []
    for ( cems in kanal ) {
        arooy.push ( `\`${ nams++ }.\` <#${ kanal[ cems ].ID.split ( ":" )[ 1 ] }>: \`${ moment.duration ( Number ( kanal[ cems ].data ) ).format ( "h [saat,] m [dakika]" ) }\` ` )
    }
    let mesajKanal = db.all ().filter ( x => x.ID.startsWith ( `3mesajKanal` ) ).sort ( function ( a , b ) {
        return b.data - a.data
    } )
    mesajKanal.length = 5 //2
    let toki = 0
    let number = 1
    let arvy = []
    for ( toki in mesajKanal ) {
        arvy.push ( `\`${ number++ }.\` <#${ mesajKanal[ toki ].ID.split ( ":" )[ 1 ] }>: \`${ mesajKanal[ toki ].data }\`` )
    }
    let publics = db.all ().filter ( x => x.ID.startsWith ( `1public` ) ).sort ( function ( a , b ) {
        return b.data - a.data
    } )
    publics.length = 5
    let tokix = 0
    let numberx = 1
    let arvey = []
    for ( tokix in publics ) {
        arvey.push ( `\`${ numberx++ }.\` <@${ publics[ tokix ].ID.split ( ":" )[ 1 ] }>: \`${ moment.duration ( Number ( publics[ tokix ].data ) ).format ( "h [saat,] m [dakika]" ) }\`` )
    }
    const toplam = new Discord.MessageEmbed()
.setAuthor(msj.author.tag, msj.author.displayAvatarURL())
.setColor("RANDOM")//fafafa
.setDescription(`**En Fazla Mesaja Sahip Olan Metin Kanalları**\n${arvy.join("\n")}\n\n**En Fazla Mesaja Sahip Olan Kullanıcılar**\n${aruuy.join("\n")}\n\n**En Fazla Aktifliğe Sahip Olan Ses Kanalları**\n${arooy.join("\n")}\n\n**En Fazla Ses Aktifliğine Sahip Olan Kullanıcılar**\n${arrays.join("\n")}\n\n**Kategoriler**\nr?pub \`Public\`: Public kategorisinin sıralaması\nr?reg \`Kayıt\`: Kayıt kategorisinin sıralaması\nr?sec \`Secret\`: Secret kategorisinin sıralaması`)

    msj.channel.send(toplam)
    //console.log ( publics )
      }
})

client.on ( "message" , async (msg) => {
    if(msg.content.startsWith("r?public") || msg.content.startsWith(".pub") || msg.content.startsWith(".pub") || msg.content.startsWith (".public")) {
    if(msg.author.bot) return;
if(!msg.member.hasPermission('ADMINISTRATOR')) return;
    let publics = db.all ().filter ( x => x.ID.startsWith ( `1public` ) ).sort ( function ( a , b ) {
        return b.data - a.data
    } )
    publics.length = 20
    let tokix = 0
    let numberx = 1
    let arvey = []
    for ( tokix in publics ) {
        arvey.push ( `\`${ numberx++ }.\` <@${ publics[ tokix ].ID.split ( ":" )[ 1 ] }>: \`${ moment.duration ( Number ( publics[ tokix ].data ) ).format ( "h [saat,] m [dakika]" ) }\`` )
    }
   const pubembed = new Discord.MessageEmbed()
.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
.setColor("RANDOM")
.setDescription(`Toplam Public Aktiflik Sıralaması\n${arvey.join("\n")}`)
msg.channel.send(pubembed)
    }
    });


client.on ( "message" , async (msg) => {
    if(msg.content.startsWith(".teyit") || msg.content.startsWith(".reg") || msg.content.startsWith(".register") || msg.content.startsWith (".kayıt")) {
    if(msg.author.bot) return;
if(!msg.member.hasPermission('ADMINISTRATOR')) return;
    let teyits = db.all ().filter ( x => x.ID.startsWith ( `1kayıt` ) ).sort ( function ( a , b ) {
        return b.data - a.data
    } )
    teyits.length = 20
    let tokix = 0
    let numberx = 1
    let arvey = []
    for ( tokix in teyits ) {
        arvey.push ( `\`${ numberx++ }.\` <@${ teyits[ tokix ].ID.split ( ":" )[ 1 ] }>: \`${ moment.duration ( Number ( teyits[ tokix ].data ) ).format ( "h [saat,] m [dakika]" ) }\`` )
    }
   const pubembed = new Discord.MessageEmbed()
.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
.setColor("RANDOM")
.setDescription(`Toplam Register Aktiflik Sıralaması\n${arvey.join("\n")}`)
msg.channel.send(pubembed)
    }
    });


client.on ( "message" , async (msg) => {
    if(msg.content.startsWith("r?secret") || msg.content.startsWith(".sec") || msg.content.startsWith(".alone") || msg.content.startsWith (".private")) {
    if(msg.author.bot) return;
if(!msg.member.hasPermission('ADMINISTRATOR')) return;
    let secrets = db.all ().filter ( x => x.ID.startsWith ( `1private` ) ).sort ( function ( a , b ) {
        return b.data - a.data
    } )
    secrets.length = 20
    let tokix = 0
    let numberx = 1
    let arvey = []
    for ( tokix in secrets ) {
        arvey.push ( `\`${ numberx++ }.\` <@${ secrets[ tokix ].ID.split ( ":" )[ 1 ] }>: \`${ moment.duration ( Number ( secrets[ tokix ].data ) ).format ( "h [saat,] m [dakika]" ) }\`` )
    }
   const pubembed = new Discord.MessageEmbed()
.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
.setColor("RANDOM")
.setDescription(`Toplam Secret Aktiflik Sıralaması\n${arvey.join("\n")}`)
msg.channel.send(pubembed)
    }
    });
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
client.on("ready", async () => {
client.user.setActivity({ name: ayarlar.durum}, { type: 'PLAYING' });
});

client.login(process.env.token);
////////////////////////////////////////////////////////////////////////