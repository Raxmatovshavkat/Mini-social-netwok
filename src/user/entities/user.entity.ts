import { Otp } from 'src/auth/otp/entities/otp.entity';
import { RefreshToken } from 'src/auth/refresh-token/entities/refresh-token.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    full_name: string;

    @Column()
    password: string;

    @Column({ type: 'enum', enum: ['inactive', 'active'] })
    status: 'inactive' | 'active';

    @Column({ default: false })
    is_verified: boolean;

    @Column({ type: 'enum', enum: ['owner', 'supervisor', 'admin'], default: 'owner' })
    role: 'owner' | 'supervisor' | 'admin';

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => Otp, otp => otp.user)
    otps: Otp[];

    @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
    refreshTokens: RefreshToken[];
    
}
