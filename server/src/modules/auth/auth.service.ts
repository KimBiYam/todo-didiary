import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { google } from 'googleapis';
import { User } from 'src/entities';
import { SocialAccount } from 'src/entities/socialAccount';
import { Repository, Transaction } from 'typeorm';
import { RegisterSocialAcountDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(SocialAccount)
    private readonly socialAccountRepository: Repository<SocialAccount>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private readonly logger = new Logger('AuthService');

  async googleLogin(user: any) {
    const { accessToken } = user;

    return {
      accessToken,
    };
  }

  async getGoogleProfile(
    accessToken: string,
  ): Promise<RegisterSocialAcountDto> {
    const { data } = await google.people('v1').people.get({
      access_token: accessToken,
      resourceName: 'people/me',
      personFields: 'names,emailAddresses,photos',
    });

    const displayName = data.names[0].displayNameLastFirst;
    const picture = data.photos[0].url;
    const email = data.emailAddresses[0].value;
    const socialId = data.names[0].metadata.source.id;

    const registerSocialAccountDto: RegisterSocialAcountDto = {
      displayName,
      picture,
      email,
      socialId,
      provider: 'google',
    };

    this.logger.debug(registerSocialAccountDto);
    return registerSocialAccountDto;
  }

  async registerGoogleAccount(
    registerSocialAcountDto: RegisterSocialAcountDto,
  ): Promise<any> {
    const {
      socialId,
      email,
      displayName,
      picture,
      provider,
    } = registerSocialAcountDto;

    const isExist = await this.userRepository.findOne({
      where: { email },
    });

    if (isExist) {
      throw new BadRequestException('This user is exist');
    }

    const user = new User();
    user.displayName = socialId;
    user.isCertified = true;
    user.email = email;
    user.picture = picture ?? undefined;
    user.displayName = displayName;
    await this.userRepository.save(user);

    const socialAccount = new SocialAccount();
    socialAccount.provider = provider;
    socialAccount.socialId = socialId;
    socialAccount.user = user;

    const result = await this.socialAccountRepository.save(socialAccount);

    return result;
  }
}
