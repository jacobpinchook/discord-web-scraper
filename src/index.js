const fs = require("fs");
const puppeteer = require("puppeteer");
const {
  Client,
  IntentsBitField,
  Message,
  EmbedBuilder,
} = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", (c) => {
  console.log(`✅ ${c.user.username} is online.`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "hey") {
    // Says hey back to sender
    await interaction.reply("hey");
  }

  if (interaction.commandName === "new-arrivals") {
    // Deferring the interaction reply to give more time for execution
    await interaction.deferReply();

    // Function that responds with each new arrival from lostenterprises website
    (async () => {
      // Use of puppeteer to scrape relevant information from website
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto("https://lostenterprises.com/new-arrivals/", {
        waitUntil: "networkidle2",
      });

      // Map information into a usable object for later access
      const products = await page.$$eval(".product-small", (elements) =>
        elements.map((e) => ({
          title: e.querySelector(".box-text .title-wrapper a").innerText,
          price: e.querySelector(".box-text .price-wrapper bdi").innerText,
          url: e.querySelector(".box-text .title-wrapper a").href,
          photo: e.querySelector(".box-image a img").getAttribute("data-src"),
        }))
      );

      await browser.close();

      // Save data to JSON file
      // fs.writeFile("products.json", JSON.stringify(products), (err) => {
      //   if (err) throw err;
      //   console.log("File saved");
      //   const products = require("../products.json");
      // });

      await interaction.editReply(
        "Web scrape complete, sending products now..."
      );

      // Iterate over new products object & reply with each product
      for (i = 0; i < products.length; i++) {
        // Each message is created with this
        const embed = new EmbedBuilder()
          .setTitle(products[i].title)
          .setImage(products[i].photo)
          .setColor(0x0099ff)
          .setURL(products[i].url)
          .setThumbnail(
            "https://media.licdn.com/dms/image/C560BAQHvs2Ygp0CBkA/company-logo_200_200/0/1630613956024/lost_enterprises_inc_logo?e=1717027200&v=beta&t=FL3uWOJ5V_W5rRFxNkO6bHo_WgIsSFYraoLxk0tg4gU"
          )
          .addFields({ name: "Price", value: products[i].price })
          .setTimestamp()
          .setFooter({
            text: "Sent by Jacob Pinchook",
          });
        // Each reply takes place here
        await interaction.followUp({ embeds: [embed] });
      }

      await interaction.editReply("All products sent successfully.");
    })();
  }
});

client.login(process.env.TOKEN);
