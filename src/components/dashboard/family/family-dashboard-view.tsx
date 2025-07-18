
'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { FullFamily, UserWithProgress } from "@/lib/data";
import { FamilyRole } from "@prisma/client";
import { Crown, Shield, User, Users } from "lucide-react";


interface FamilyDashboardViewProps {
    family: FullFamily;
    currentUser: UserWithProgress;
}

const roleIcons: Record<FamilyRole, React.ReactNode> = {
    [FamilyRole.LEADER]: <Crown className="h-4 w-4 text-amber-400" />,
    [FamilyRole.CO_LEADER]: <Shield className="h-4 w-4 text-blue-400" />,
    [FamilyRole.MEMBER]: <User className="h-4 w-4 text-muted-foreground" />,
}

export function FamilyDashboardView({ family, currentUser }: FamilyDashboardViewProps) {
    
    const canInvite = currentUser.familyMember?.role === FamilyRole.LEADER || currentUser.familyMember?.role === FamilyRole.CO_LEADER;

    return (
        <div className="main-view space-y-6">
            <Card className="overflow-hidden">
                <div className="relative h-32 bg-muted">
                    <img src="https://placehold.co/1200x200.png" alt="Family Banner" className="w-full h-full object-cover" data-ai-hint="mafia pattern" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-end gap-4">
                         <Avatar className="h-24 w-24 border-4 border-background">
                            <AvatarImage src={family.avatarUrl || ''} alt={family.name} data-ai-hint="family crest" />
                            <AvatarFallback>{family.tag}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-white shadow-lg">[{family.tag}] {family.name}</h2>
                             <p className="text-muted-foreground text-white/80 max-w-2xl truncate">{family.description}</p>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Miembros de la Familia</CardTitle>
                                <CardDescription>Los soldados que forman tu imperio.</CardDescription>
                            </div>
                            {canInvite && <Button size="sm">Invitar Miembro</Button>}
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {family.members.map(member => (
                                    <div key={member.userId} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                                        <Avatar>
                                             <AvatarImage src={member.user.avatarUrl || ''} alt={member.user.name} />
                                            <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-grow">
                                            <p className="font-semibold">{member.user.name}</p>
                                            <p className="text-xs text-muted-foreground">{member.user.title}</p>
                                        </div>
                                        <Badge variant="outline" className="flex items-center gap-2">
                                            {roleIcons[member.role]}
                                            <span>{member.role}</span>
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                 <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Estadísticas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Miembros</span>
                                <span className="font-bold">{family.members.length}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Puntos Totales</span>
                                <span className="font-bold">--</span>
                            </div>
                            <Separator />
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Posición Ranking</span>
                                <span className="font-bold">--</span>
                            </div>
                        </CardContent>
                    </Card>
                     <Button variant="destructive" className="w-full mt-4">Abandonar Familia</Button>
                </div>
            </div>
        </div>
    )

}
