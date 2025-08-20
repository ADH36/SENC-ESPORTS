/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('games').del();
  
  // Inserts seed entries
  await knex('games').insert([
    {
      id: 1,
      name: 'Valorant',
      description: 'A 5v5 character-based tactical FPS where precise gunplay meets unique agent abilities.',
      image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Valorant%20game%20logo%20esports%20tournament%20banner&image_size=square',
      status: 'active'
    },
    {
      id: 2,
      name: 'Counter-Strike 2',
      description: 'The legendary tactical FPS game with competitive 5v5 matches.',
      image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Counter%20Strike%202%20CS2%20game%20logo%20esports%20tournament&image_size=square',
      status: 'active'
    },
    {
      id: 3,
      name: 'PUBG Mobile',
      description: 'Battle royale game where 100 players fight to be the last one standing.',
      image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=PUBG%20Mobile%20battle%20royale%20game%20logo%20esports&image_size=square',
      status: 'active'
    },
    {
      id: 4,
      name: 'Free Fire',
      description: 'Fast-paced battle royale game designed for mobile devices.',
      image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Free%20Fire%20mobile%20battle%20royale%20game%20logo%20esports&image_size=square',
      status: 'active'
    },
    {
      id: 5,
      name: 'League of Legends',
      description: 'Multiplayer online battle arena (MOBA) game with strategic team-based gameplay.',
      image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=League%20of%20Legends%20MOBA%20game%20logo%20esports%20tournament&image_size=square',
      status: 'active'
    },
    {
      id: 6,
      name: 'Dota 2',
      description: 'Complex MOBA game with deep strategic gameplay and large prize pools.',
      image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Dota%202%20MOBA%20game%20logo%20esports%20tournament&image_size=square',
      status: 'active'
    },
    {
      id: 7,
      name: 'Rocket League',
      description: 'Vehicular soccer game combining racing and football elements.',
      image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Rocket%20League%20vehicular%20soccer%20game%20logo%20esports&image_size=square',
      status: 'active'
    },
    {
      id: 8,
      name: 'Apex Legends',
      description: 'Hero-based battle royale game with unique character abilities.',
      image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Apex%20Legends%20battle%20royale%20hero%20shooter%20game%20logo&image_size=square',
      status: 'active'
    }
  ]);
};